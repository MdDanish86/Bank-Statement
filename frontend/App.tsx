import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import ResultTable from './components/ResultTable';
import Spinner from './components/Spinner';
import FileUpload from './components/FileUpload';
import TransactionSummary from './components/TransactionSummary';
import ViewToggle from './components/ViewToggle';
import Dashboard from './components/Dashboard';

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const App: React.FC = () => {
  // ✅ FIXED HERE — removed default sample text
  const [ocrText, setOcrText] = useState<string>('');

  const [csvResult, setCsvResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [view, setView] = useState<'table' | 'dashboard'>('table');

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      setOcrText('');
    }
  };

  const handleParse = useCallback(async () => {
    if (!file && !ocrText.trim()) {
      setError('Please upload a file or paste your bank statement text.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCsvResult('');

    try {
      let response;

      if (file) {
        const base64Data = await fileToBase64(file);

        response = await fetch(`${API_URL}/api/parse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mimeType: file.type,
            data: base64Data,
          }),
        });
      } else {
        response = await fetch(`${API_URL}/api/parse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: ocrText,
          }),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to parse transactions');
      }

      const result = await response.text();
      setCsvResult(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [ocrText, file]);

  const processedData = useMemo(() => {
    if (!csvResult) return null;

    const lines = csvResult.trim().split('\n');
    if (lines.length <= 1) return null;

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const amountIndex = headers.indexOf('amount');
    const categoryIndex = headers.indexOf('category');
    const descriptionIndex = headers.indexOf('description');

    if (amountIndex === -1 || categoryIndex === -1 || descriptionIndex === -1) return null;

    let totalCredit = 0;
    let totalDebit = 0;
    const spendingByCategory: { [key: string]: number } = {};
    const topExpenses: { description: string; amount: number }[] = [];
    const transactions = lines.slice(1);

    for (const line of transactions) {
      const values = line.split(',');

      if (values.length > Math.max(amountIndex, categoryIndex, descriptionIndex)) {
        const amount = parseFloat(values[amountIndex]);
        const category = values[categoryIndex].trim();
        const description = values[descriptionIndex].trim();

        if (!isNaN(amount)) {
          if (amount > 0) {
            totalCredit += amount;
          } else {
            totalDebit += amount;
            if (category) {
              spendingByCategory[category] =
                (spendingByCategory[category] || 0) + Math.abs(amount);
            }
            topExpenses.push({ description, amount: Math.abs(amount) });
          }
        }
      }
    }

    topExpenses.sort((a, b) => b.amount - a.amount);

    return {
      summary: {
        count: transactions.length,
        credit: totalCredit,
        debit: totalDebit,
      },
      spendingByCategory,
      topExpenses: topExpenses.slice(0, 5),
    };
  }, [csvResult]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Input Section */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-cyan-400">
              Upload or Paste Statement
            </h2>

            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={file}
              disabled={isLoading}
            />

            <textarea
              value={ocrText}
              onChange={(e) => {
                setOcrText(e.target.value);
                if (file) setFile(null);
              }}
              placeholder="Paste your raw text here..."
              className="w-full h-64 p-4 bg-gray-800 border border-gray-700 rounded-lg resize-none"
              disabled={isLoading || !!file}
            />

            <button
              onClick={handleParse}
              disabled={isLoading || (!file && !ocrText.trim())}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg"
            >
              {isLoading ? 'Processing...' : 'Parse Transactions'}
            </button>
          </div>

          {/* Output Section */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-cyan-400">
              Parsed Transactions
            </h2>

            {processedData?.summary && !isLoading && (
              <TransactionSummary summary={processedData.summary} />
            )}

            <div className="bg-gray-800 rounded-lg p-4 min-h-[24rem]">
              {isLoading && (
                <div className="text-center">
                  <Spinner />
                  <p>AI is parsing your document...</p>
                </div>
              )}

              {error && <p className="text-red-400">Error: {error}</p>}

              {!isLoading && !error && processedData && (
                view === 'table'
                  ? <ResultTable csvData={csvResult} />
                  : <Dashboard data={processedData} />
              )}

              {!isLoading && !error && !processedData && (
                <p className="text-gray-500">Results will be displayed here.</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
