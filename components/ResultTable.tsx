
import React, { useMemo } from 'react';

interface ResultTableProps {
  csvData: string;
}

interface Transaction {
  [key: string]: string;
}

const ResultTable: React.FC<ResultTableProps> = ({ csvData }) => {
  const { headers, data } = useMemo(() => {
    if (!csvData) return { headers: [], data: [] };
    const lines = csvData.trim().split('\n');
    if (lines.length < 1) return { headers: [], data: [] };

    const headers = lines[0].split(',').map(h => h.trim());
    const data: Transaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      // Basic handling for commas inside descriptions
      if (values.length > headers.length) {
          const description = values.slice(1, values.length - (headers.length - 2)).join(',');
          const restOfValues = values.slice(values.length - (headers.length - 2));
          values.splice(1, values.length - headers.length + 1, description, ...restOfValues);
      }
      
      if (values.length === headers.length) {
        // Fix: Untyped function calls may not accept type arguments.
        // Refactored from .reduce to Object.fromEntries for better readability and to fix the error.
        const row: Transaction = Object.fromEntries(
          headers.map((header, index) => [header, values[index] ? values[index].trim() : ''])
        );
        data.push(row);
      }
    }
    return { headers, data };
  }, [csvData]);

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No transactions found or data is invalid.
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm text-left text-gray-400">
        <thead className="text-xs text-cyan-400 uppercase bg-gray-700 sticky top-0">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-700 hover:bg-gray-600">
              {headers.map((header, colIndex) => {
                const value = row[header];
                const isAmount = header.toLowerCase() === 'amount';
                const amountValue = isAmount ? parseFloat(value) : NaN;
                const amountColor = isNaN(amountValue)
                  ? ''
                  : amountValue >= 0
                  ? 'text-green-400'
                  : 'text-red-400';

                return (
                  <td key={`${rowIndex}-${colIndex}`} className={`px-4 py-3 ${isAmount ? amountColor : 'text-gray-200'}`}>
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
