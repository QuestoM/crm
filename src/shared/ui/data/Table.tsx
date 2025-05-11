import React, { ReactNode } from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => ReactNode);
  className?: string;
  sortable?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  sortColumn?: keyof T;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
  rowClassName?: (row: T, index: number) => string;
}

/**
 * Table component with RTL support and sorting capabilities
 * Supports custom column rendering, row clicking, and loading states
 */
export function Table<T>({
  data,
  columns,
  className = '',
  onRowClick,
  isLoading = false,
  emptyMessage = 'אין נתונים להצגה',
  sortColumn,
  sortDirection,
  onSort,
  rowClassName,
}: TableProps<T>) {
  const isRtl = useRtlDirection();
  
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || typeof column.accessor !== 'string' || !onSort) return;
    
    const accessor = column.accessor as keyof T;
    const direction = 
      sortColumn === accessor && sortDirection === 'asc' ? 'desc' : 'asc';
    
    onSort(accessor, direction);
  };
  
  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable || typeof column.accessor !== 'string') return null;
    
    const accessor = column.accessor as keyof T;
    const isActive = sortColumn === accessor;
    
    return (
      <span className={`ml-1 inline-block ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
        {isActive && sortDirection === 'asc' ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    );
  };
  
  const renderCellValue = (row: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    
    const value = row[column.accessor];
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    return value as ReactNode;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table 
        className="min-w-full divide-y divide-gray-200"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`
                  px-6 
                  py-3 
                  text-xs 
                  font-medium 
                  text-gray-500 
                  uppercase 
                  tracking-wider
                  ${isRtl ? 'text-right' : 'text-left'}
                  ${column.sortable ? 'cursor-pointer' : ''}
                  ${column.className || ''}
                `}
                onClick={column.sortable ? () => handleSort(column) : undefined}
              >
                <div className="flex items-center">
                  {column.header}
                  {column.sortable && renderSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`
                ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                ${rowClassName ? rowClassName(row, rowIndex) : ''}
              `}
              onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`
                    px-6 
                    py-4 
                    whitespace-nowrap 
                    text-sm 
                    ${isRtl ? 'text-right' : 'text-left'}
                    ${column.className || ''}
                  `}
                >
                  {renderCellValue(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 