import React from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, name, error, containerClassName = '', className = '', ...rest }) => {
  const isRtl = useRtlDirection();
  const textareaId = id || name;

  return (
    <div className={`mb-4 ${containerClassName}`}>
      <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        id={textareaId}
        name={name}
        rows={4} // Default rows
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