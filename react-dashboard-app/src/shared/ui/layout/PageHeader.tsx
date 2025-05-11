import React, { ReactNode } from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode[];
  className?: string;
  backLink?: {
    href: string;
    label: string;
  };
}

/**
 * PageHeader component for consistent page headers with actions
 * Supports title, description, action buttons, and back navigation
 * Automatically handles RTL text alignment
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions = [],
  className = '',
  backLink
}) => {
  const isRtl = useRtlDirection();
  
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="text-right mb-4 sm:mb-0">
          {backLink && (
            <a 
              href={backLink.href}
              className={`text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <span className={`${isRtl ? 'mr-2' : 'ml-2'}`}>
                {backLink.label}
              </span>
              <svg 
                className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
        
        {actions.length > 0 && (
          <div className="flex flex-row gap-2 justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}; 