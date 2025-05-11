import React, { useState } from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface DatePickerProps {
  label?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  error?: string;
  hint?: string;
  className?: string;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  min?: Date;
  max?: Date;
  id?: string;
  name?: string;
  placeholder?: string;
}

/**
 * DatePicker component with RTL support
 * Uses native input[type=date] with proper formatting for Hebrew dates
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  hint,
  className = '',
  fullWidth = true,
  required = false,
  disabled = false,
  min,
  max,
  id,
  name,
  placeholder,
}) => {
  const isRtl = useRtlDirection();
  const datePickerId = id || `datepicker-${name || Math.random().toString(36).substr(2, 9)}`;
  
  // Convert Date to YYYY-MM-DD format for input
  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  
  // Convert string from input to Date object
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    if (!dateString) {
      onChange && onChange(null);
      return;
    }
    
    const date = new Date(dateString);
    onChange && onChange(date);
  };
  
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={datePickerId}
          className={`block text-gray-700 font-medium mb-1 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          {label}
          {required && <span className="text-red-600 mr-1">*</span>}
        </label>
      )}

      <input
        type="date"
        id={datePickerId}
        name={name}
        value={formatDateForInput(value)}
        onChange={handleChange}
        disabled={disabled}
        min={min ? formatDateForInput(min) : undefined}
        max={max ? formatDateForInput(max) : undefined}
        required={required}
        placeholder={placeholder}
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
          ${isRtl ? 'text-right' : 'text-left'}
        `}
        dir={isRtl ? 'rtl' : 'ltr'}
        aria-invalid={!!error}
        aria-describedby={error ? `${datePickerId}-error` : hint ? `${datePickerId}-hint` : undefined}
      />

      {error && (
        <p
          id={`${datePickerId}-error`}
          className={`mt-1 text-sm text-red-600 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          {error}
        </p>
      )}

      {hint && !error && (
        <p
          id={`${datePickerId}-hint`}
          className={`mt-1 text-sm text-gray-500 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}; 