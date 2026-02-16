
import React from 'react';
import CategoryChart from './charts/CategoryChart';
import CreditDebitChart from './charts/CreditDebitChart';
import TopExpenses from './TopExpenses';

interface DashboardProps {
    data: {
        summary: {
            credit: number;
            debit: number;
        };
        spendingByCategory: { [key: string]: number };
        topExpenses: { description: string, amount: number }[];
    };
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-2 overflow-y-auto">
            <div className="lg:col-span-2 bg-gray-900/50 p-4 rounded-lg shadow-inner">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Spending by Category</h3>
                <CategoryChart spendingData={data.spendingByCategory} />
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg shadow-inner">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Credit vs. Debit</h3>
                <CreditDebitChart credit={data.summary.credit} debit={Math.abs(data.summary.debit)} />
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg shadow-inner">
                 <h3 className="text-lg font-semibold text-cyan-400 mb-2">Top 5 Expenses</h3>
                 <TopExpenses expenses={data.topExpenses} />
            </div>
        </div>
    );
};

export default Dashboard;
