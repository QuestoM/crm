import React, { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  fluid?: boolean;
  narrow?: boolean;
}

/**
 * Responsive container component for consistent layout sizing
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  fluid = false,
  narrow = false,
}) => {
  const baseClasses = 'mx-auto px-4 w-full';
  
  const widthClasses = fluid 
    ? 'max-w-full' 
    : narrow 
      ? 'max-w-3xl' 
      : 'max-w-7xl';
  
  return (
    <div className={`${baseClasses} ${widthClasses} ${className}`}>
      {children}
    </div>
  );
}; 