import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperTextClassName?: string;
  errorClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  helperTextClassName = '',
  errorClassName = '',
  disabled,
  ...props
}, ref) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  // Label sizes
  const labelSizes = {
    sm: 'text-xs mb-1',
    md: 'text-sm mb-1.5',
    lg: 'text-base mb-2',
  };

  // Base input classes
  const baseInputClasses = `
    block rounded-md border-gray-300 shadow-sm 
    focus:border-blue-500 focus:ring-blue-500
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
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
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`${baseInputClasses} ${widthClasses} ${inputClassName} ${className}`}
          disabled={disabled}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            {rightIcon}
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
