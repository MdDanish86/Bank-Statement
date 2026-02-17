
import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import ResultTable from './components/ResultTable';
import Spinner from './components/Spinner';
import FileUpload from './components/FileUpload';
import TransactionSummary from './components/TransactionSummary';
import ViewToggle from './components/ViewToggle';
import Dashboard from './components/Dashboard';

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // result is "data:mime/type;base64,...", we need to remove the prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};


const App: React.FC = () => {
  const [ocrText, setOcrText] = useState<string>(`
Date Description Debit Credit Balance
25/06/2024 ZOMATO ONLINE ORDER 549.00 45,123.50
Transaction ID: 12345
24/06/2024 AMAZON PAYMENTS 1,299.00 45,672.50
23/06/2024 ATM WITHDRAWAL/CASH/MUMBAI 5,000.00 46,971.50
22-06-2024 SALARY CREDIT JUNE 2024 55,000.00 51,971.50
IMPS/P2A/54321/SALARY
21 Jun 2024 UBER INDIA SYSTEMS PVT 350.50 43,028.50
20.06.2024 UPI/TRANSFER/TO JOHN DOE 1000.00 43,379.00
`);
  const [csvResult, setCsvResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [view, setView] = useState<'table' | 'dashboard'>('table');

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      setOcrText(''); // Clear text area when a file is selected
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

      response = await fetch('http://localhost:5000/api/parse', {
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
      response = await fetch('http://localhost:5000/api/parse', {
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
    const topExpenses: { description: string, amount: number }[] = [];
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
              spendingByCategory[category] = (spendingByCategory[category] || 0) + Math.abs(amount);
            }
            topExpenses.push({ description, amount: Math.abs(amount) });
          }
        }
      }
    }

    // Sort top expenses and take the top 5
    topExpenses.sort((a, b) => b.amount - a.amount);
    
    return {
      summary: {
        count: transactions.length,
        credit: totalCredit,
        debit: totalDebit,
      },
      spendingByCategory,
      topExpenses: topExpenses.slice(0, 5)
    };
  }, [csvResult]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-semibold text-cyan-400">Upload or Paste Statement</h2>
            <FileUpload onFileSelect={handleFileSelect} selectedFile={file} disabled={isLoading} />
            
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <textarea
              value={ocrText}
              onChange={(e) => {
                setOcrText(e.target.value);
                if (file) {
                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                  setFile(null);
                }
              }}
              placeholder="Paste your raw text here..."
              className="w-full h-64 p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none shadow-lg disabled:opacity-50 disabled:bg-gray-800/50"
              disabled={isLoading || !!file}
            />
            <button
              onClick={handleParse}
              disabled={isLoading || (!file && !ocrText.trim())}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Processing...
                </>
              ) : (
                'Parse Transactions'
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-cyan-400">Parsed Transactions</h2>
              {processedData && <ViewToggle view={view} setView={setView} />}
            </div>

            {processedData?.summary && !isLoading && <TransactionSummary summary={processedData.summary} />}
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex-grow min-h-[24rem] shadow-lg">
              {isLoading && (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <Spinner />
                    <p className="mt-2 text-gray-400">AI is parsing your document...</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-center items-center h-full text-red-400">
                  <p>Error: {error}</p>
                </div>
              )}
              {!isLoading && !error && processedData && (
                view === 'table' ? (
                  <ResultTable csvData={csvResult} />
                ) : (
                  <Dashboard data={processedData} />
                )
              )}
              {!isLoading && !error && !processedData && (
                 <div className="flex justify-center items-center h-full text-gray-500">
                    <p>Results will be displayed here.</p>
                 </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
