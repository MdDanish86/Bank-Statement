
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold text-white text-center">
          <span className="text-cyan-400">AI</span> Bank Statement Parser
        </h1>
        <p className="text-center text-gray-400 mt-1">
          Instantly convert messy statement text into clean, categorized CSV data.
        </p>
      </div>
    </header>
  );
};

export default Header;
