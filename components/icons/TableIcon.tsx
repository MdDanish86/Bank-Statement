
import React from 'react';

const TableIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M3.375 12h17.25M3.375 12a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5h17.25a1.5 1.5 0 011.5 1.5v3.75a1.5 1.5 0 01-1.5 1.5M3.375 12v6.75a1.5 1.5 0 001.5 1.5h14.25a1.5 1.5 0 001.5-1.5V12" 
    />
  </svg>
);

export default TableIcon;
