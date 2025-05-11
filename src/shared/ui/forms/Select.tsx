import React, { SelectHTMLAttributes } from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  className?: string;
  fullWidth?: boolean;
  required?: boolean;
  dir?: 'rtl' | 'ltr' | 'auto';
  placeholder?: string;
}

/**
 * Reusable Select component with proper RTL support
 * Handles label, options, error messages, and select attributes
 */
export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  hint,
  className = '',
  fullWidth = true,
  required = false,
  dir,
  id,
  placeholder,
  ...props
}) => {
  const isRtl = useRtlDirection();
  const selectId = id || `select-${props.name || Math.random().toString(36).substr(2, 9)}`;
  const textDirection = dir || (isRtl ? 'rtl' : 'ltr');
  const textAlign = textDirection === 'rtl' ? 'text-right' : 'text-left';
  
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={selectId}
          className={`block text-gray-700 font-medium mb-1 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          {label}
          {required && <span className="text-red-600 mr-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={`
            w-full
            appearance-none
            px-3
            py-2
            border
            rounded-md
            text-gray-900
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            pr-10
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${textAlign}
          `}
          dir={textDirection}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>

      {error && (
        <p
          id={`${selectId}-error`}
          className={`mt-1 text-sm text-red-600 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          {error}
        </p>
      )}

      {hint && !error && (
        <p
          id={`${selectId}-hint`}
          className={`mt-1 text-sm text-gray-500 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}; 