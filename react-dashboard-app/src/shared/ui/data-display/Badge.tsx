import React, { ReactNode } from 'react';

export type BadgeColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  rounded?: boolean;
  className?: string;
  pill?: boolean;
  dot?: boolean;
}

/**
 * Badge component for status indicators, counts, and labels
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'primary',
  size = 'md',
  rounded = false,
  pill = false,
  dot = false,
  className = '',
}) => {
  // Color classes
  const colorClasses = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-indigo-100 text-indigo-800',
    light: 'bg-gray-50 text-gray-600',
    dark: 'bg-gray-700 text-gray-50',
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  // Shape classes
  const shapeClass = pill ? 'rounded-full' : rounded ? 'rounded-md' : 'rounded';

  // Combine all classes
  const badgeClasses = `
    inline-flex items-center justify-center font-medium
    ${colorClasses[color]} 
    ${sizeClasses[size]} 
    ${shapeClass}
    ${className}
  `;

  // Render a dot badge if requested
  if (dot) {
    return (
      <span className="relative inline-flex">
        <span>{children}</span>
        <span
          className={`absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3 ${colorClasses[color].split(' ')[0]}`}
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3"></span>
        </span>
      </span>
    );
  }

  return <span className={badgeClasses}>{children}</span>;
}; 