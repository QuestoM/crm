import React, { ReactNode } from 'react';
import { Skeleton } from '../feedback/Skeleton';
import { Pagination } from '../navigation/Pagination';

export type SortDirection = 'asc' | 'desc';
export type FilterType = 'text' | 'select' | 'date' | 'number' | 'boolean';

// Type for column definition
export interface ColumnDefinition<T> {
  header: string;
  accessor: ((row: T) => ReactNode) | keyof T;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: FilterType;
  filterOptions?: Array<{ value: string | number; label: string }>;
  width?: string;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

// Pagination props
export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

// Sorting props
export interface SortingProps {
  sortColumn?: string;
  sortDirection?: SortDirection;
  onSortChange?: (column: string, direction: SortDirection) => void;
}

// Filtering props
export interface FilteringProps {
  filterVisible?: boolean;
  onToggleFilters?: () => void;
  filters?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void;
}

// DataGrid props
export interface DataGridProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationProps;
  sorting?: SortingProps;
  filtering?: FilteringProps;
  onRowClick?: (row: T) => void;
  className?: string;
  rowClassName?: string | ((row: T, index: number) => string);
}

/**
 * DataGrid component for displaying data in tabular format
 * Supports pagination, sorting, filtering, and row selection
 */
export function DataGrid<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  pagination,
  sorting,
  filtering,
  onRowClick,
  className = '',
  rowClassName = '',
}: DataGridProps<T>) {
  // Handle sorting column header click
  const handleSortClick = (column: ColumnDefinition<T>) => {
    if (!column.sortable || !sorting || !sorting.onSortChange) return;
    
    const accessor = typeof column.accessor === 'string' ? column.accessor : '';
    if (!accessor) return;
    
    // Toggle direction if clicking the same column, otherwise default to asc
    const newDirection: SortDirection = 
      sorting.sortColumn === accessor && sorting.sortDirection === 'asc' ? 'desc' : 'asc';
    
    sorting.onSortChange(accessor, newDirection);
  };
  
  // Handle filter change
  const handleFilterChange = (
    column: ColumnDefinition<T>, 
    value: string | number | boolean | null
  ) => {
    if (!filtering || !filtering.onFilterChange) return;
    
    const accessor = typeof column.accessor === 'string' ? column.accessor : '';
    if (!accessor) return;
    
    // Clone current filters and update
    const newFilters = { ...filtering.filters };
    
    if (value === '' || value === null) {
      // Remove filter if empty
      delete newFilters[accessor];
    } else {
      // Set filter value
      newFilters[accessor] = value;
    }
    
    filtering.onFilterChange(newFilters);
  };
  
  // Get display value from row using accessor
  const getCellValue = (row: T, accessor: ((row: T) => ReactNode) | keyof T): ReactNode => {
    if (typeof accessor === 'function') {
      return accessor(row);
    }
    
    const value = row[accessor as keyof T];
    return value as ReactNode;
  };
  
  // Get sort icon based on current sort state
  const getSortIcon = (column: ColumnDefinition<T>): ReactNode => {
    if (!column.sortable || !sorting) return null;
    
    const accessor = typeof column.accessor === 'string' ? column.accessor : '';
    const isSorted = accessor === sorting.sortColumn;
    
    return (
      <span className="ml-2 text-gray-400">
        {isSorted && sorting.sortDirection === 'asc' && '▲'}
        {isSorted && sorting.sortDirection === 'desc' && '▼'}
        {!isSorted && '↕'}
      </span>
    );
  };
  
  // Render filter input for column
  const renderFilterInput = (column: ColumnDefinition<T>) => {
    if (!column.filterable || !filtering) return null;
    
    const accessor = typeof column.accessor === 'string' ? column.accessor : '';
    if (!accessor) return null;
    
    const currentValue = filtering.filters?.[accessor] || '';
    
    switch (column.filterType) {
      case 'select':
        return (
          <select
            className="w-full p-1 text-sm border border-gray-300 rounded"
            value={currentValue}
            onChange={(e) => handleFilterChange(column, e.target.value)}
          >
            <option value="">כל הערכים</option>
            {column.filterOptions?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            className="w-full p-1 text-sm border border-gray-300 rounded"
            value={currentValue}
            onChange={(e) => handleFilterChange(column, e.target.value)}
            placeholder="סנן..."
          />
        );
      
      default: // text filter
        return (
          <input
            type="text"
            className="w-full p-1 text-sm border border-gray-300 rounded"
            value={currentValue}
            onChange={(e) => handleFilterChange(column, e.target.value)}
            placeholder="סנן..."
          />
        );
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
        <div className="overflow-x-auto">
          <Skeleton count={5} height="5rem" />
        </div>
      </div>
    );
  }
  
  // Render empty state
  if (!data.length) {
    return (
      <div className={`bg-white overflow-hidden shadow rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }
  
  // Get row class name
  const getRowClassName = (row: T, index: number): string => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row, index);
    }
    return rowClassName;
  };
  
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  style={{ width: column.width }}
                  className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.headerClassName || ''}`}
                  onClick={() => column.sortable && handleSortClick(column)}
                >
                  <div className="flex items-center justify-end">
                    {column.header}
                    {column.sortable && getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
            
            {/* Filter row */}
            {filtering && filtering.filterVisible && (
              <tr className="bg-gray-50 border-t border-gray-200">
                {columns.map((column, index) => (
                  <th key={`filter-${index}`} className="px-6 py-2">
                    {column.filterable && renderFilterInput(column)}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${getRowClassName(row, rowIndex)}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 ${column.cellClassName || ''}`}
                  >
                    {getCellValue(row, column.accessor)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                מציג <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> עד{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}
                </span>{' '}
                מתוך <span className="font-medium">{pagination.totalCount}</span> תוצאות
              </p>
            </div>
            
            <div className="flex items-center">
              {pagination.pageSizeOptions && pagination.onPageSizeChange && (
                <div className="mr-4">
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    value={pagination.pageSize}
                    onChange={(e) => 
                      pagination.onPageSizeChange?.(parseInt(e.target.value, 10))
                    }
                  >
                    {pagination.pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size} שורות
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={Math.ceil(pagination.totalCount / pagination.pageSize)}
                onPageChange={pagination.onPageChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 