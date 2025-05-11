import React, { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  fluid?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * Container component for consistent layout structure
 * Supports various max widths and fluid container options
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  fluid = false,
  maxWidth = 'lg'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    'full': 'max-w-full',
  };

  return (
    <div className={`
      mx-auto 
      px-4 
      ${fluid ? 'w-full' : maxWidthClasses[maxWidth]} 
      ${className}
    `}>
      {children}
    </div>
  );
}; 