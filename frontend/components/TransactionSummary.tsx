
import React from 'react';
import ArrowUpCircleIcon from './icons/ArrowUpCircleIcon';
import ArrowDownCircleIcon from './icons/ArrowDownCircleIcon';
import ListBulletIcon from './icons/ListBulletIcon';

interface SummaryProps {
  summary: {
    count: number;
    credit: number;
    debit: number;
  };
}

const SummaryCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
  <div className="bg-gray-800 p-4 rounded-lg flex items-center space-x-4 shadow-lg">
    <div className={`p-2 rounded-full ${colorClass.replace('text-', 'bg-').replace('400', '500/20')}`}>
        {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
    </div>
  </div>
);

const TransactionSummary: React.FC<SummaryProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard
        icon={<ListBulletIcon className="h-6 w-6 text-cyan-400" />}
        label="Total Transactions"
        value={summary.count}
        colorClass="text-cyan-400"
      />
      <SummaryCard
        icon={<ArrowUpCircleIcon className="h-6 w-6 text-green-400" />}
        label="Total Credit"
        value={summary.credit.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        colorClass="text-green-400"
      />
      <SummaryCard
        icon={<ArrowDownCircleIcon className="h-6 w-6 text-red-400" />}
        label="Total Debit"
        value={Math.abs(summary.debit).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        colorClass="text-red-400"
      />
    </div>
  );
};

export default TransactionSummary;
