import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
  disabled?: boolean;
  showFirstLastButtons?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Pagination component for navigating through pages
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = '',
  disabled = false,
  showFirstLastButtons = false,
  size = 'md',
}) => {
  // Don't render pagination for single page
  if (totalPages <= 1) {
    return null;
  }

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  // Generate page numbers
  const generatePageNumbers = (): (number | string)[] => {
    const totalNumbers = siblingCount * 2 + 3; // siblings + current + first + last
    const totalBlocks = totalNumbers + 2; // +2 for the '...' blocks

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, '...', ...middleRange, '...', totalPages];
    }

    return [];
  };

  const pageNumbers = generatePageNumbers();

  // Button base classes
  const buttonBaseClasses = `
    relative inline-flex items-center justify-center
    border text-sm font-medium
    focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    ${sizeClasses[size]}
  `;

  // Active/current page classes
  const activeClasses = 'z-10 bg-blue-50 border-blue-500 text-blue-600';
  
  // Inactive page classes
  const inactiveClasses = 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50';
  
  // Navigation buttons classes
  const navButtonClasses = `${buttonBaseClasses} ${inactiveClasses}`;

  return (
    <nav className={`relative z-0 inline-flex rounded-md shadow-sm -space-x-px ${className}`} aria-label="Pagination">
      {/* First page button */}
      {showFirstLastButtons && (
        <button
          type="button"
          onClick={() => !disabled && onPageChange(1)}
          disabled={disabled || currentPage === 1}
          className={`${navButtonClasses} rounded-l-md`}
          aria-label="Go to first page"
        >
          <span className="sr-only">First</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M7.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L3.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      {/* Previous page button */}
      <button
        type="button"
        onClick={() => !disabled && onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        className={`${navButtonClasses} ${!showFirstLastButtons ? 'rounded-l-md' : ''}`}
        aria-label="Previous page"
      >
        <span className="sr-only">Previous</span>
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Page numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className={`${buttonBaseClasses} bg-white border-gray-300 text-gray-700`}
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        
        return (
          <button
            key={`page-${page}`}
            type="button"
            onClick={() => !disabled && onPageChange(page as number)}
            disabled={disabled}
            className={`${buttonBaseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}
      
      {/* Next page button */}
      <button
        type="button"
        onClick={() => !disabled && onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        className={`${navButtonClasses} ${!showFirstLastButtons ? 'rounded-r-md' : ''}`}
        aria-label="Next page"
      >
        <span className="sr-only">Next</span>
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      {/* Last page button */}
      {showFirstLastButtons && (
        <button
          type="button"
          onClick={() => !disabled && onPageChange(totalPages)}
          disabled={disabled || currentPage === totalPages}
          className={`${navButtonClasses} rounded-r-md`}
          aria-label="Go to last page"
        >
          <span className="sr-only">Last</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M12.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L16.586 10l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </nav>
  );
}; 