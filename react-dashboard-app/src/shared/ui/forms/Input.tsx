import React from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, name, error, containerClassName = '', className = '', ...rest }) => {
  const isRtl = useRtlDirection();
  const inputId = id || name; // Use name as fallback id

  return (
    <div className={`mb-4 ${containerClassName}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-blue-500 focus:border-blue-500 
          sm:text-sm 
          ${error ? 'border-red-500' : 'border-gray-300'} 
          ${isRtl ? 'text-right' : 'text-left'} 
          ${className}
        `}
        dir={isRtl ? 'rtl' : 'ltr'}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}; 