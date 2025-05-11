import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'filled' | 'outlined' | 'text';
export type ButtonColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  rounded?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
}

/**
 * Button component for user interactions
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  fullWidth = false,
  rounded = false,
  className = '',
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled,
  ...props
}) => {
  // Combine variant and color for style
  const getColorClasses = (): string => {
    const colors = {
      primary: {
        filled: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-300',
        outlined: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-300',
        text: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-300',
      },
      secondary: {
        filled: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-300',
        outlined: 'border border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-300',
        text: 'text-gray-600 hover:bg-gray-50 focus:ring-gray-300',
      },
      success: {
        filled: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-300',
        outlined: 'border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-300',
        text: 'text-green-600 hover:bg-green-50 focus:ring-green-300',
      },
      danger: {
        filled: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-300',
        outlined: 'border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-300',
        text: 'text-red-600 hover:bg-red-50 focus:ring-red-300',
      },
      warning: {
        filled: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-300',
        outlined: 'border border-yellow-500 text-yellow-500 hover:bg-yellow-50 focus:ring-yellow-300',
        text: 'text-yellow-500 hover:bg-yellow-50 focus:ring-yellow-300',
      },
      info: {
        filled: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-300',
        outlined: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-300',
        text: 'text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-300',
      },
    };

    return colors[color][variant];
  };

  // Size classes
  const sizeClasses = {
    xs: 'text-xs px-2.5 py-1.5',
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-3',
  };

  // Shape classes
  const shapeClass = rounded ? 'rounded-full' : 'rounded-md';
  
  // Width classes
  const widthClass = fullWidth ? 'w-full' : '';

  // Disabled classes
  const disabledClass = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : '';

  // Combined classes
  const buttonClasses = `
    inline-flex items-center justify-center font-medium
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-colors duration-200 ease-in-out
    ${getColorClasses()} 
    ${sizeClasses[size]} 
    ${shapeClass}
    ${widthClass}
    ${disabledClass}
    ${className}
  `;

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}; 