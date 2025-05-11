import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'default';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = "font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 rounded-md',
    lg: 'px-6 py-3 text-lg rounded-lg',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500',
    default: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-blue-500',
  };
  
  // Width
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Disabled
  const disabledClasses = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${disabledClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin rtl:ml-2 rtl:mr-0" />
      )}
      {leftIcon && <span className="mr-2 rtl:ml-2 rtl:mr-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2 rtl:mr-2 rtl:ml-0">{rightIcon}</span>}
    </button>
  );
}; 