import React from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  containerClassName?: string;
}

export const Select: React.FC<SelectProps> = ({ 
    label, 
    id, 
    name, 
    options, 
    error, 
    placeholder, 
    containerClassName = '', 
    className = '', 
    ...rest 
}) => {
  const isRtl = useRtlDirection();
  const selectId = id || name;

  return (
    <div className={`mb-4 ${containerClassName}`}>
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-blue-500 focus:border-blue-500 
          sm:text-sm 
          bg-white 
          ${error ? 'border-red-500' : 'border-gray-300'} 
          ${isRtl ? 'text-right pr-8' : 'text-left pl-3'} 
          ${className}
        `}
        dir={isRtl ? 'rtl' : 'ltr'}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}; 