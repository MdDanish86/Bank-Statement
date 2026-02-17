
import React from 'react';
import TableIcon from './icons/TableIcon';
import ChartPieIcon from './icons/ChartPieIcon';

interface ViewToggleProps {
  view: 'table' | 'dashboard';
  setView: (view: 'table' | 'dashboard') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, setView }) => {
  return (
    <div className="flex items-center bg-gray-700 rounded-full p-1">
      <button
        onClick={() => setView('table')}
        className={`p-2 rounded-full transition-colors duration-300 ${
          view === 'table' ? 'bg-cyan-600 shadow' : 'hover:bg-gray-600'
        }`}
        aria-label="Table View"
      >
        <TableIcon className="h-5 w-5 text-white" />
      </button>
      <button
        onClick={() => setView('dashboard')}
        className={`p-2 rounded-full transition-colors duration-300 ${
          view === 'dashboard' ? 'bg-cyan-600 shadow' : 'hover:bg-gray-600'
        }`}
        aria-label="Dashboard View"
      >
        <ChartPieIcon className="h-5 w-5 text-white" />
      </button>
    </div>
  );
};

export default ViewToggle;
