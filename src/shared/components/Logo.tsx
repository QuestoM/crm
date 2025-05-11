import React from 'react';

interface LogoProps {
  className?: string;
}

/**
 * Logo component for the water filter CRM
 * Used in header, sidebar, and login pages
 */
export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.66 8.34a1 1 0 00-.66-.29 1 1 0 00-.66.29l-3.1 3.1A4 4 0 1014 18a3.91 3.91 0 002.56-1l3.1-3.1a1 1 0 000-1.42zM14 16a2 2 0 112-2 2 2 0 01-2 2zm4.73-8.24A6 6 0 1010 16.73 10 10 0 113.3 19.4 10.17 10.17 0 012 18a10 10 0 1116.73-10.24z" />
      </svg>
      <span className="font-bold text-lg text-gray-900 mr-2">מים ישראל</span>
    </div>
  );
}; 