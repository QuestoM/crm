import React from 'react';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  label?: string;
  fullPage?: boolean;
}

/**
 * Loader component for displaying loading state
 */
export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  color = 'primary',
  label,
  fullPage = false,
}) => {
  // Size classes for the spinner
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };
  
  // Color classes for the spinner
  const colorClasses = {
    primary: 'border-blue-500 border-t-transparent',
    secondary: 'border-gray-300 border-t-transparent',
    white: 'border-white border-t-transparent',
  };
  
  const spinner = (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        rounded-full animate-spin
      `}
      role="status"
    />
  );
  
  // If fullPage is true, center the spinner in the viewport
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="text-center">
          {spinner}
          {label && <p className="mt-2 text-gray-600">{label}</p>}
        </div>
      </div>
    );
  }
  
  // Default inline display
  return (
    <div className="flex items-center">
      {spinner}
      {label && <span className="ml-2 text-gray-600">{label}</span>}
    </div>
  );
}; 