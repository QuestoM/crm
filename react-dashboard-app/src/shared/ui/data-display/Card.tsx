import React, { ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  bordered?: boolean;
  hoverable?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Card component for organizing content into containers
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  bordered = true,
  hoverable = false,
  shadow = 'sm',
}) => {
  // Shadow classes
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-md',
    xl: 'shadow-lg',
  };

  // Border class
  const borderClass = bordered ? 'border border-gray-200' : '';

  // Hover effect
  const hoverClass = hoverable ? 'transition-shadow duration-300 hover:shadow-md' : '';

  // Combine all card classes
  const cardClasses = `
    bg-white rounded-lg overflow-hidden
    ${shadowClasses[shadow]}
    ${borderClass}
    ${hoverClass}
    ${className}
  `;

  // Header exists if title or subtitle is provided
  const hasHeader = Boolean(title || subtitle);

  return (
    <div className={cardClasses}>
      {hasHeader && (
        <div className={`px-6 py-4 border-b border-gray-200 ${headerClassName}`}>
          {title && (
            typeof title === 'string' 
              ? <h3 className="text-lg font-medium text-gray-900">{title}</h3> 
              : title
          )}
          {subtitle && (
            typeof subtitle === 'string' 
              ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> 
              : subtitle
          )}
        </div>
      )}
      
      <div className={`px-6 py-4 ${bodyClassName}`}>{children}</div>
      
      {footer && (
        <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
}; 