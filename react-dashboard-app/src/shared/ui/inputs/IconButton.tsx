import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export type IconButtonVariant = 'filled' | 'outlined' | 'ghost';
export type IconButtonColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: IconButtonVariant;
  color?: IconButtonColor;
  size?: IconButtonSize;
  rounded?: boolean;
  isLoading?: boolean;
  tooltip?: string;
}

/**
 * IconButton component for icon-only buttons
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  rounded = false,
  className = '',
  isLoading = false,
  disabled,
  tooltip,
  ...props
}) => {
  // Combine variant and color for style
  const getColorClasses = (): string => {
    const colors = {
      primary: {
        filled: 'bg-blue-600 hover:bg-blue-700 text-white',
        outlined: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
        ghost: 'text-blue-600 hover:bg-blue-50',
      },
      secondary: {
        filled: 'bg-gray-600 hover:bg-gray-700 text-white',
        outlined: 'border border-gray-600 text-gray-600 hover:bg-gray-50',
        ghost: 'text-gray-600 hover:bg-gray-50',
      },
      success: {
        filled: 'bg-green-600 hover:bg-green-700 text-white',
        outlined: 'border border-green-600 text-green-600 hover:bg-green-50',
        ghost: 'text-green-600 hover:bg-green-50',
      },
      danger: {
        filled: 'bg-red-600 hover:bg-red-700 text-white',
        outlined: 'border border-red-600 text-red-600 hover:bg-red-50',
        ghost: 'text-red-600 hover:bg-red-50',
      },
      warning: {
        filled: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        outlined: 'border border-yellow-500 text-yellow-500 hover:bg-yellow-50',
        ghost: 'text-yellow-500 hover:bg-yellow-50',
      },
      info: {
        filled: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        outlined: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
        ghost: 'text-indigo-600 hover:bg-indigo-50',
      },
    };

    return colors[color][variant];
  };

  // Size classes
  const sizeClasses = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  // Icon sizes
  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  // Shape classes
  const shapeClass = rounded ? 'rounded-full' : 'rounded-md';
  
  // Disabled classes
  const disabledClass = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : '';

  // Combined classes
  const buttonClasses = `
    inline-flex items-center justify-center
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color === 'primary' ? 'blue' : color}-300
    transition-colors duration-200 ease-in-out
    ${getColorClasses()} 
    ${sizeClasses[size]} 
    ${shapeClass}
    ${disabledClass}
    ${className}
  `;

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      title={tooltip}
      {...props}
    >
      {isLoading ? (
        <svg 
          className={`animate-spin ${iconSizes[size]}`} 
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
      ) : (
        <div className={iconSizes[size]}>
          {icon}
        </div>
      )}
    </button>
  );
}; 