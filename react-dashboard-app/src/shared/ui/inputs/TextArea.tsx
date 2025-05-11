import React, { TextareaHTMLAttributes, forwardRef } from 'react';

export type TextAreaSize = 'sm' | 'md' | 'lg';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: TextAreaSize;
  fullWidth?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  textareaClassName?: string;
  helperTextClassName?: string;
  errorClassName?: string;
  resizable?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  helperText,
  error,
  size = 'md',
  fullWidth = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  textareaClassName = '',
  helperTextClassName = '',
  errorClassName = '',
  disabled,
  resizable = true,
  ...props
}, ref) => {
  // Size classes
  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm',
    lg: 'p-4 text-base',
  };

  // Label sizes
  const labelSizes = {
    sm: 'text-xs mb-1',
    md: 'text-sm mb-1.5',
    lg: 'text-base mb-2',
  };

  // Base textarea classes
  const baseTextareaClasses = `
    block rounded-md border-gray-300 shadow-sm 
    focus:border-blue-500 focus:ring-blue-500
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${!resizable ? 'resize-none' : ''}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
  `;

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthClasses} ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={props.id} 
          className={`block font-medium text-gray-700 ${labelSizes[size]} ${labelClassName}`}
        >
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={`${baseTextareaClasses} ${widthClasses} ${textareaClassName} ${className}`}
        disabled={disabled}
        rows={props.rows || 4}
        {...props}
      />
      
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