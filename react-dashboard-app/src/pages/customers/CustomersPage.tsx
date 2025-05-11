import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../AppLayout';
import { PageHeader } from '../../shared/ui/layout/PageHeader';
import { Button } from '../../shared/ui/inputs/Button';
import { Card } from '../../shared/ui/data-display/Card';
import { DataGrid, FilteringProps, PaginationProps, SortingProps } from '../../shared/ui/data/DataGrid';
import { Badge } from '../../shared/ui/data-display/Badge';
import { Alert } from '../../shared/ui/feedback/Alert';
import { Toast } from '../../shared/ui/feedback/Toast';
import { Skeleton } from '../../shared/ui/feedback/Skeleton';
import { Input } from '../../shared/ui/inputs/Input';
import { Select } from '../../shared/ui/inputs/Select';
import { 
  getCustomers, 
  CustomerFilters, 
  Customer,
  deleteCustomer 
} from '../../services/api/customersService';

// Customer status badge variants
const statusVariants = {
  active: 'success',
  inactive: 'error',
  prospect: 'warning',
} as const;

/**
 * Customers management page component
 */
const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationProps>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    onPageChange: (page) => setPagination(prev => ({ ...prev, currentPage: page })),
    pageSizeOptions: [10, 25, 50],
    onPageSizeChange: (size) => setPagination(prev => ({ ...prev, pageSize: size, currentPage: 1 })),
  });
  
  // Sorting state
  const [sorting, setSorting] = useState<SortingProps>({
    sortColumn: 'created_at',
    sortDirection: 'desc',
    onSortChange: (column, direction) => 
      setSorting({ sortColumn: column, sortDirection: direction }),
  });
  
  // Filtering state
  const [filtering, setFiltering] = useState<FilteringProps>({
    filterVisible: false,
    onToggleFilters: () => setFiltering(prev => ({ ...prev, filterVisible: !prev.filterVisible })),
    filters: {},
    onFilterChange: (filters) => {
      setFiltering(prev => ({ ...prev, filters }));
      // Reset to first page when filters change
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    },
  });
  
  // Customer search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Load customers data
  useEffect(() => {
    async function loadCustomers() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Combine filters
        const combinedFilters: CustomerFilters = {
          ...filtering.filters,
          ...(searchTerm ? { search: searchTerm } : {}),
        };
        
        const response = await getCustomers(
          pagination.currentPage,
          pagination.pageSize,
          combinedFilters,
          sorting.sortColumn,
          sorting.sortDirection
        );
        
        if (response.success && response.data) {
          setCustomers(response.data.customers);
          setTotalCustomers(response.data.total);
          setPagination(prev => ({ ...prev, totalCount: response.data.total }));
        } else {
          setError(response.error?.message || 'Failed to load customers');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadCustomers();
  }, [
    pagination.currentPage, 
    pagination.pageSize, 
    filtering.filters, 
    sorting.sortColumn, 
    sorting.sortDirection, 
    searchTerm
  ]);
  
  // Handle search with debounce
  const handleSearch = (value: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setSearchTerm(value);
    }, 500);
    
    setSearchTimeout(timeout);
  };
  
  // Handle customer deletion
  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק לקוח זה? פעולה זו לא ניתנת לביטול.')) {
      try {
        const response = await deleteCustomer(id);
        
        if (response.success) {
          setToast({ message: 'הלקוח נמחק בהצלחה', type: 'success' });
          // Reload customers
          setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== id));
          setTotalCustomers(prev => prev - 1);
        } else {
          setToast({ message: response.error?.message || 'שגיאה במחיקת הלקוח', type: 'error' });
        }
      } catch (err) {
        setToast({ 
          message: err instanceof Error ? err.message : 'שגיאה במחיקת הלקוח', 
          type: 'error' 
        });
      }
    }
  };
  
  // Customer grid columns
  const columns = [
    {
      header: 'שם',
      accessor: (customer: Customer) => (
        <div>
          <div className="font-semibold">{customer.first_name} {customer.last_name}</div>
          <div className="text-xs text-gray-500">{customer.email}</div>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      header: 'טלפון',
      accessor: 'phone',
      sortable: false,
    },
    {
      header: 'כתובת',
      accessor: 'address',
      sortable: false,
    },
    {
      header: 'סטטוס',
      accessor: (customer: Customer) => (
        <Badge 
          variant={statusVariants[customer.status] || 'default'}
          size="sm"
        >
          {customer.status === 'active' ? 'פעיל' : 
           customer.status === 'inactive' ? 'לא פעיל' : 'פוטנציאלי'}
        </Badge>
      ),
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'active', label: 'פעיל' },
        { value: 'inactive', label: 'לא פעיל' },
        { value: 'prospect', label: 'פוטנציאלי' },
      ],
    },
    {
      header: 'הזמנות',
      accessor: 'total_orders',
      sortable: true,
      filterable: true,
      filterType: 'number',
    },
    {
      header: 'סה"כ הוצאות',
      accessor: (customer: Customer) => (
        <span className="font-medium">
          ₪{customer.total_spent.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
        </span>
      ),
      sortable: true,
      filterable: true,
      filterType: 'number',
    },
    {
      header: 'תאריך הצטרפות',
      accessor: (customer: Customer) => 
        new Date(customer.created_at).toLocaleDateString('he-IL'),
      sortable: true,
    },
    {
      header: 'פעולות',
      accessor: (customer: Customer) => (
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/customers/${customer.id}`);
            }}
          >
            ערוך
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCustomer(customer.id);
            }}
          >
            מחק
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <MainLayout>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      <PageHeader
        title="ניהול לקוחות"
        description={`סה"כ ${totalCustomers} לקוחות במערכת`}
        actions={[
          <Button
            key="add-customer"
            variant="primary"
            onClick={() => navigate('/customers/new')}
          >
            לקוח חדש
          </Button>,
          <Button
            key="toggle-filters"
            variant="secondary"
            onClick={filtering.onToggleFilters}
          >
            {filtering.filterVisible ? 'הסתר סינון' : 'הצג סינון'}
          </Button>
        ]}
      />
      
      <div className="mb-6">
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <Input
                placeholder="חיפוש לפי שם, אימייל..."
                onChange={(e) => handleSearch(e.target.value)}
                fullWidth
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={sorting.sortColumn}
                onChange={(e) => 
                  setSorting(prev => ({ ...prev, sortColumn: e.target.value }))
                }
                options={[
                  { value: 'created_at', label: 'תאריך הצטרפות' },
                  { value: 'total_orders', label: 'מספר הזמנות' },
                  { value: 'total_spent', label: 'סה"כ הוצאות' },
                  { value: 'last_name', label: 'שם משפחה' },
                ]}
                label="מיון לפי"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={sorting.sortDirection}
                onChange={(e) => 
                  setSorting(prev => ({ ...prev, sortDirection: e.target.value as 'asc' | 'desc' }))
                }
                options={[
                  { value: 'desc', label: 'סדר יורד' },
                  { value: 'asc', label: 'סדר עולה' },
                ]}
                label="כיוון מיון"
              />
            </div>
          </div>
        </Card>
      </div>
      
      {error ? (
        <Alert type="error" title="שגיאה בטעינת הנתונים">
          {error}
        </Alert>
      ) : (
        <DataGrid
          columns={columns}
          data={customers}
          isLoading={isLoading}
          emptyMessage="לא נמצאו לקוחות התואמים את החיפוש"
          pagination={pagination}
          sorting={sorting}
          filtering={filtering}
          onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
        />
      )}
    </MainLayout>
  );
};

export default CustomersPage; 