import React, { InputHTMLAttributes, forwardRef } from 'react';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: CheckboxSize;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  checkboxClassName?: string;
  helperTextClassName?: string;
  errorClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  size = 'md',
  error,
  helperText,
  className = '',
  containerClassName = '',
  labelClassName = '',
  checkboxClassName = '',
  helperTextClassName = '',
  errorClassName = '',
  disabled,
  ...props
}, ref) => {
  // Size classes for the checkbox
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Text size classes
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Base checkbox classes
  const baseCheckboxClasses = `
    rounded border-gray-300 text-blue-600
    focus:ring-blue-500 
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-300 focus:ring-red-500' : ''}
    ${sizeClasses[size]}
  `;

  return (
    <div className={`${containerClassName}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`${baseCheckboxClasses} ${checkboxClassName} ${className}`}
            disabled={disabled}
            {...props}
          />
        </div>
        
        {label && (
          <div className="ml-2">
            <label 
              htmlFor={props.id} 
              className={`${textSizeClasses[size]} font-medium text-gray-700 ${disabled ? 'text-gray-500' : ''} ${labelClassName}`}
            >
              {label}
            </label>
          </div>
        )}
      </div>
      
      {error ? (
        <p className={`mt-1 text-sm text-red-600 ${errorClassName}`}>
          {error}
        </p>
      ) : helperText ? (
        <p className={`mt-1 text-sm text-gray-500 ${helperTextClassName}`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}); 