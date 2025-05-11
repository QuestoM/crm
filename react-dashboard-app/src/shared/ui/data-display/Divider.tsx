import React, { ReactNode } from 'react';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  children?: ReactNode;
  className?: string;
  color?: string;
  spacing?: number | string;
  dashed?: boolean;
  thickness?: number;
}

/**
 * Divider component for visual separation
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  children,
  className = '',
  color = 'gray-200',
  spacing = 4, // 1rem default spacing
  dashed = false,
  thickness = 1,
}) => {
  const baseStyle = `bg-${color} ${dashed ? 'border-dashed' : ''}`;
  
  // Handle spacing for text/content if any
  let spacingClass = '';
  if (typeof spacing === 'number') {
    spacingClass = `p-${spacing}`;
  } else {
    spacingClass = `p-[${spacing}]`;
  }

  // Content divider with text alignment
  if (children && orientation === 'horizontal') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`flex-grow ${baseStyle}`} style={{ height: `${thickness}px` }} />
        <span className={`flex-shrink ${spacingClass}`}>{children}</span>
        <div className={`flex-grow ${baseStyle}`} style={{ height: `${thickness}px` }} />
      </div>
    );
  }

  // Simple horizontal divider
  if (orientation === 'horizontal') {
    return (
      <div 
        className={`w-full ${baseStyle} ${className}`} 
        style={{ height: `${thickness}px` }}
      />
    );
  }

  // Simple vertical divider
  return (
    <div 
      className={`h-full ${baseStyle} ${className}`} 
      style={{ width: `${thickness}px` }}
    />
  );
};
