import React, { useState, InputHTMLAttributes, forwardRef, useEffect } from 'react';

export type SwitchSize = 'sm' | 'md' | 'lg';
export type SwitchColor = 'primary' | 'success' | 'danger' | 'warning' | 'info';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  size?: SwitchSize;
  color?: SwitchColor;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  switchClassName?: string;
  helperTextClassName?: string;
  errorClassName?: string;
  labelPosition?: 'left' | 'right';
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  label,
  size = 'md',
  color = 'primary',
  error,
  helperText,
  className = '',
  containerClassName = '',
  labelClassName = '',
  switchClassName = '',
  helperTextClassName = '',
  errorClassName = '',
  disabled,
  checked,
  defaultChecked,
  onChange,
  labelPosition = 'right',
  ...props
}, ref) => {
  // Internal state for the switch
  const [isChecked, setIsChecked] = useState<boolean>(
    checked !== undefined ? checked : defaultChecked || false
  );

  // Update internal state when controlled from outside
  useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (checked === undefined) {
      setIsChecked(e.target.checked);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  // Switch sizes
  const switchSizes = {
    sm: {
      container: 'h-4 w-7',
      thumb: 'h-3 w-3',
      translateX: 'translate-x-3',
      textSize: 'text-xs',
    },
    md: {
      container: 'h-5 w-9',
      thumb: 'h-4 w-4',
      translateX: 'translate-x-4',
      textSize: 'text-sm',
    },
    lg: {
      container: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translateX: 'translate-x-5',
      textSize: 'text-base',
    },
  };

  // Switch colors
  const switchColors = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-500',
    info: 'bg-indigo-600',
  };

  // Base label classes
  const baseLabelClasses = `
    font-medium text-gray-700 
    ${switchSizes[size].textSize}
    ${disabled ? 'text-gray-500' : ''}
  `;

  return (
    <div className={`${containerClassName}`}>
      <div className={`flex items-center ${labelPosition === 'left' ? 'flex-row-reverse justify-end' : ''}`}>
        <div className="flex-shrink-0">
          <button
            type="button"
            role="switch"
            aria-checked={isChecked}
            onClick={() => {
              if (!disabled) {
                const newValue = !isChecked;
                const e = {
                  target: {
                    checked: newValue,
                    name: props.name,
                  },
                } as React.ChangeEvent<HTMLInputElement>;
                
                handleChange(e);
              }
            }}
            className={`
              relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer
              transition-colors ease-in-out duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color === 'primary' ? 'blue' : color}-500
              ${isChecked ? switchColors[color] : 'bg-gray-200'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${switchSizes[size].container}
              ${switchClassName}
              ${className}
            `}
          >
            <span 
              className={`
                relative inline-block rounded-full bg-white shadow
                transform ring-0 transition ease-in-out duration-200
                ${isChecked ? switchSizes[size].translateX : 'translate-x-0'}
                ${switchSizes[size].thumb}
              `}
            />
          </button>
          
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            disabled={disabled}
            onChange={handleChange}
            {...props}
          />
        </div>
        
        {label && (
          <label 
            className={`
              ${baseLabelClasses} 
              ${labelPosition === 'left' ? 'mr-3' : 'ml-3'}
              ${labelClassName}
            `}
          >
            {label}
          </label>
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