import React, { InputHTMLAttributes } from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  fullWidth?: boolean;
  required?: boolean;
  dir?: 'rtl' | 'ltr' | 'auto';
}

/**
 * Reusable Input component with proper RTL support
 * Handles label, error messages, and input attributes
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  className = '',
  fullWidth = true,
  required = false,
  dir,
  id,
  ...props
}) => {
  const isRtl = useRtlDirection();
  const inputId = id || `input-${props.name || Math.random().toString(36).substr(2, 9)}`;
  const textDirection = dir || (isRtl ? 'rtl' : 'ltr');
  const textAlign = textDirection === 'rtl' ? 'text-right' : 'text-left';
  
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-gray-700 font-medium mb-1 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          {label}
          {required && <span className="text-red-600 mr-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        className={`
          w-full
          px-3
          py-2
          border
          rounded-md
          text-gray-900
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${textAlign}
        `}
        dir={textDirection}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        required={required}
        {...props}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          className={`mt-1 text-sm text-red-600 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          {error}
        </p>
      )}

      {hint && !error && (
        <p
          id={`${inputId}-hint`}
          className={`mt-1 text-sm text-gray-500 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}; 