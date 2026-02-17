
import React from 'react';
import TrendingDownIcon from './icons/TrendingDownIcon';

interface TopExpensesProps {
  expenses: { description: string, amount: number }[];
}

const TopExpenses: React.FC<TopExpensesProps> = ({ expenses }) => {
  if (expenses.length === 0) {
    return <p className="text-gray-500 text-center mt-8">No expense data to display.</p>;
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense, index) => (
        <div key={index} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-md">
          <div className="flex items-center space-x-3 truncate">
            <TrendingDownIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-gray-300 truncate">{expense.description}</p>
          </div>
          <p className="font-semibold text-red-400 flex-shrink-0 ml-2">
            {expense.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TopExpenses;
