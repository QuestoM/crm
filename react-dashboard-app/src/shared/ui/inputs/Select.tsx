import React, { SelectHTMLAttributes, ReactNode, forwardRef } from 'react';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: SelectSize;
  fullWidth?: boolean;
  options?: SelectOption[];
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  helperTextClassName?: string;
  errorClassName?: string;
  startIcon?: ReactNode;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  error,
  size = 'md',
  fullWidth = false,
  options = [],
  className = '',
  containerClassName = '',
  labelClassName = '',
  selectClassName = '',
  helperTextClassName = '',
  errorClassName = '',
  disabled,
  startIcon,
  children,
  ...props
}, ref) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-8 pl-2 pr-8 text-xs',
    md: 'h-10 pl-3 pr-10 text-sm',
    lg: 'h-12 pl-4 pr-12 text-base',
  };

  // Label sizes
  const labelSizes = {
    sm: 'text-xs mb-1',
    md: 'text-sm mb-1.5',
    lg: 'text-base mb-2',
  };

  // Base select classes
  const baseSelectClasses = `
    block rounded-md border-gray-300 shadow-sm
    focus:border-blue-500 focus:ring-blue-500
    disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
    appearance-none bg-no-repeat
    ${sizeClasses[size]}
    ${startIcon ? 'pl-10' : ''}
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
        {startIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            {startIcon}
          </div>
        )}
        
        <select
          ref={ref}
          className={`${baseSelectClasses} ${widthClasses} ${selectClassName} ${className}`}
          disabled={disabled}
          {...props}
        >
          {children || options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
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