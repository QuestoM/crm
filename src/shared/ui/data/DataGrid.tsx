import React, { useState, useEffect } from 'react';
import { useRtlDirection } from '../../utils/rtl';
import { Table } from './Table';
import { Select } from '../forms/Select';
import { Input } from '../forms/Input';
import { DatePicker } from '../forms/DatePicker';

interface DataGridColumn<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'boolean';
  filterOptions?: { value: string; label: string }[];
  width?: string;
  className?: string;
  headerClassName?: string;
  cellClassName?: string | ((data: T) => string);
}

interface DataGridProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: {
    pageSize: number;
    totalCount: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    pageSizeOptions?: number[];
    onPageSizeChange?: (pageSize: number) => void;
  };
  defaultSortColumn?: keyof T;
  defaultSortDirection?: 'asc' | 'desc';
  onSortChange?: (column: keyof T, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  className?: string;
  filterVisible?: boolean;
  onToggleFilters?: () => void;
  rowClassName?: (row: T, index: number) => string;
  serverSideProcessing?: boolean;
}

/**
 * Advanced DataGrid component with RTL support
 * Supports pagination, sorting, filtering, and row selection
 */
export function DataGrid<T extends { id: string | number }>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'אין נתונים להצגה',
  pagination,
  defaultSortColumn,
  defaultSortDirection = 'asc',
  onSortChange,
  onRowClick,
  onFilterChange,
  className = '',
  filterVisible = false,
  onToggleFilters,
  rowClassName,
  serverSideProcessing = false,
}: DataGridProps<T>) {
  const isRtl = useRtlDirection();
  const [sortColumn, setSortColumn] = useState<keyof T | undefined>(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [currentPage, setCurrentPage] = useState(pagination?.currentPage || 1);
  
  // Handle sort changes
  const handleSort = (column: keyof T, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    
    if (onSortChange) {
      onSortChange(column, direction);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (column: string, value: any) => {
    const newFilters = { ...filters, [column]: value };
    
    // Clear empty filters
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] === '' || newFilters[key] === null || newFilters[key] === undefined) {
        delete newFilters[key];
      }
    });
    
    setFilters(newFilters);
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };
  
  // Apply filters and sorting if not server-side
  useEffect(() => {
    if (serverSideProcessing) {
      setFilteredData(data);
      return;
    }
    
    let result = [...data];
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      result = result.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          const column = columns.find(col => 
            typeof col.accessor === 'string' && col.accessor === key
          );
          
          if (!column) return true;
          
          const itemValue = item[key as keyof T];
          
          if (value === null || value === undefined || value === '') {
            return true;
          }
          
          if (column.filterType === 'text' && typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(String(value).toLowerCase());
          }
          
          if (column.filterType === 'select') {
            return itemValue === value;
          }
          
          if (column.filterType === 'date' && itemValue instanceof Date && value instanceof Date) {
            return (
              itemValue.getFullYear() === value.getFullYear() &&
              itemValue.getMonth() === value.getMonth() &&
              itemValue.getDate() === value.getDate()
            );
          }
          
          if (column.filterType === 'boolean') {
            return itemValue === value;
          }
          
          return itemValue === value;
        });
      });
    }
    
    // Apply sorting if column is sortable
    if (sortColumn) {
      const column = columns.find(col => 
        typeof col.accessor === 'string' && col.accessor === sortColumn
      );
      
      if (column && column.sortable) {
        result.sort((a, b) => {
          const aValue = a[sortColumn];
          const bValue = b[sortColumn];
          
          if (aValue === bValue) return 0;
          
          if (aValue === null || aValue === undefined) return 1;
          if (bValue === null || bValue === undefined) return -1;
          
          if (aValue instanceof Date && bValue instanceof Date) {
            return sortDirection === 'asc'
              ? aValue.getTime() - bValue.getTime()
              : bValue.getTime() - aValue.getTime();
          }
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
              ? aValue.localeCompare(bValue, 'he')
              : bValue.localeCompare(aValue, 'he');
          }
          
          return sortDirection === 'asc'
            ? (aValue < bValue ? -1 : 1)
            : (bValue < aValue ? -1 : 1);
        });
      }
    }
    
    setFilteredData(result);
  }, [data, filters, sortColumn, sortDirection, columns, serverSideProcessing]);
  
  // Calculate current page data if pagination is enabled and not server-side
  const currentData = pagination && !serverSideProcessing
    ? filteredData.slice(
        (currentPage - 1) * pagination.pageSize,
        currentPage * pagination.pageSize
      )
    : filteredData;
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    if (pagination?.onPageChange) {
      pagination.onPageChange(page);
    }
  };
  
  // Convert DataGridColumn to TableColumn
  const tableColumns = columns.map(column => ({
    header: column.header,
    accessor: column.accessor,
    sortable: column.sortable,
    className: column.className,
  }));
  
  // Render pagination controls
  const renderPagination = () => {
    if (!pagination) return null;
    
    const { pageSize, totalCount, pageSizeOptions, onPageSizeChange } = pagination;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return (
      <div 
        className={`
          flex flex-wrap items-center justify-between 
          py-3 border-t border-gray-200
          ${isRtl ? 'flex-row-reverse' : ''}
        `}
      >
        <div className="flex-1 flex flex-wrap items-center">
          {pageSizeOptions && onPageSizeChange && (
            <div className={isRtl ? 'mr-0 ml-4' : 'ml-0 mr-4'}>
              <Select
                className="w-auto inline-block"
                options={pageSizeOptions.map(size => ({ value: size, label: `${size} שורות` }))}
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              />
            </div>
          )}
          
          <span className="text-sm text-gray-700">
            מציג{' '}
            <span className="font-medium">
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>
            {' '}-{' '}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>
            {' '}מתוך{' '}
            <span className="font-medium">{totalCount}</span> תוצאות
          </span>
        </div>
        
        <div>
          <nav className="flex items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
                relative inline-flex items-center px-2 py-2 rounded-md border 
                ${currentPage === 1
                  ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }
                ${isRtl ? 'mr-1' : 'ml-1'}
              `}
              aria-label="Previous"
            >
              <span className="sr-only">Previous</span>
              <svg
                className={`h-5 w-5 ${isRtl ? 'transform rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            
            {totalPages <= 7
              ? Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`
                      relative inline-flex items-center px-4 py-2 text-sm font-medium
                      ${currentPage === page
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }
                      border mx-1 rounded-md
                    `}
                  >
                    {page}
                  </button>
                ))
              : renderPaginationWithEllipsis(totalPages)
            }
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`
                relative inline-flex items-center px-2 py-2 rounded-md border 
                ${currentPage === totalPages || totalPages === 0
                  ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                }
                ${isRtl ? 'ml-1' : 'mr-1'}
              `}
              aria-label="Next"
            >
              <span className="sr-only">Next</span>
              <svg
                className={`h-5 w-5 ${isRtl ? 'transform rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    );
  };
  
  // Render pagination with ellipsis for large page counts
  const renderPaginationWithEllipsis = (totalPages: number) => {
    // Always show first, last, current, and pages adjacent to current
    const pages = [];
    
    // First page
    pages.push(1);
    
    // Pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    // Last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    // Sort and deduplicate
    const uniquePages = [...new Set(pages)].sort((a, b) => a - b);
    
    // Add ellipsis where needed
    const result = [];
    let previousPage = 0;
    
    for (const page of uniquePages) {
      if (page - previousPage > 1) {
        result.push('ellipsis' + previousPage);
      }
      result.push(page);
      previousPage = page;
    }
    
    return result.map((item, index) => {
      if (typeof item === 'string' && item.startsWith('ellipsis')) {
        return (
          <span
            key={item}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 mx-1"
          >
            ...
          </span>
        );
      }
      
      const page = item as number;
      return (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`
            relative inline-flex items-center px-4 py-2 text-sm font-medium
            ${currentPage === page
              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            }
            border mx-1 rounded-md
          `}
        >
          {page}
        </button>
      );
    });
  };
  
  // Render filter controls
  const renderFilters = () => {
    if (!filterVisible) return null;
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-md mb-4">
        <div className="flex flex-wrap gap-4">
          {columns
            .filter(column => column.filterable && typeof column.accessor === 'string')
            .map(column => {
              const accessor = column.accessor as string;
              const filterValue = filters[accessor] || '';
              
              return (
                <div key={accessor} className="w-full sm:w-auto flex-grow max-w-xs">
                  {column.filterType === 'text' && (
                    <Input
                      label={column.header}
                      value={filterValue}
                      onChange={(e) => handleFilterChange(accessor, e.target.value)}
                      placeholder={`סנן לפי ${column.header}`}
                    />
                  )}
                  
                  {column.filterType === 'select' && column.filterOptions && (
                    <Select
                      label={column.header}
                      options={[
                        { value: '', label: `כל ה${column.header}` },
                        ...column.filterOptions
                      ]}
                      value={filterValue}
                      onChange={(e) => handleFilterChange(accessor, e.target.value)}
                    />
                  )}
                  
                  {column.filterType === 'date' && (
                    <DatePicker
                      label={column.header}
                      value={filterValue || null}
                      onChange={(date) => handleFilterChange(accessor, date)}
                    />
                  )}
                  
                  {column.filterType === 'boolean' && (
                    <Select
                      label={column.header}
                      options={[
                        { value: '', label: 'הכל' },
                        { value: 'true', label: 'כן' },
                        { value: 'false', label: 'לא' }
                      ]}
                      value={filterValue !== undefined ? String(filterValue) : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFilterChange(
                          accessor, 
                          value === '' ? undefined : value === 'true'
                        );
                      }}
                    />
                  )}
                </div>
              );
            })}
        </div>
        
        {Object.keys(filters).length > 0 && (
          <div className={`mt-4 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
            <button
              type="button"
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setFilters({});
                if (onFilterChange) {
                  onFilterChange({});
                }
              }}
            >
              נקה סינון
            </button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={className}>
      <div className={`mb-4 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
        {columns.some(column => column.filterable) && onToggleFilters && (
          <button
            type="button"
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={onToggleFilters}
          >
            <svg 
              className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 text-gray-500`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
              />
            </svg>
            {filterVisible ? 'הסתר סינון' : 'הצג סינון'}
          </button>
        )}
      </div>
      
      {renderFilters()}
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <Table
          data={currentData}
          columns={tableColumns}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={onRowClick}
          rowClassName={rowClassName}
        />
        
        {renderPagination()}
      </div>
    </div>
  );
} 