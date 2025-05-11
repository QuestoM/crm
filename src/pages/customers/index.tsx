import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../shared/ui/layout/MainLayout';
import { Container } from '../../shared/ui/layout/Container';
import { PageHeader } from '../../shared/ui/layout/PageHeader';
import { DataGrid } from '../../shared/ui/data/DataGrid';
import { sidebarItems, userMenuItems, notifications } from '../../shared/data/mockData.tsx';
import { Alert } from '../../shared/ui/feedback/Alert';
import { Toast } from '../../shared/ui/feedback/Toast';
import { Logo } from '../../shared/components/Logo';

// Mock customer data
const CUSTOMERS = [
  {
    id: '1',
    first_name: 'משה',
    last_name: 'כהן',
    email: 'moshe@example.com',
    phone: '050-1234567',
    address: 'רחוב הרצל 10, תל אביב',
    created_at: new Date('2023-01-10'),
    status: 'active',
    total_orders: 12,
    total_spent: 8450,
    last_order_date: new Date('2023-03-15'),
  },
  {
    id: '2',
    first_name: 'רונית',
    last_name: 'לוי',
    email: 'ronit@example.com',
    phone: '052-9876543',
    address: 'רחוב ביאליק 5, רמת גן',
    created_at: new Date('2023-02-15'),
    status: 'active',
    total_orders: 5,
    total_spent: 3200,
    last_order_date: new Date('2023-03-10'),
  },
  {
    id: '3',
    first_name: 'דוד',
    last_name: 'אברהם',
    email: 'david@example.com',
    phone: '054-7654321',
    address: 'רחוב הנביאים 20, ירושלים',
    created_at: new Date('2023-01-05'),
    status: 'inactive',
    total_orders: 2,
    total_spent: 1200,
    last_order_date: new Date('2023-01-20'),
  },
  {
    id: '4',
    first_name: 'שרה',
    last_name: 'זילברמן',
    email: 'sarah@example.com',
    phone: '053-1122334',
    address: 'רחוב רוטשילד 15, תל אביב',
    created_at: new Date('2023-03-01'),
    status: 'active',
    total_orders: 8,
    total_spent: 5600,
    last_order_date: new Date('2023-03-25'),
  },
  {
    id: '5',
    first_name: 'יעקב',
    last_name: 'גולדברג',
    email: 'yaakov@example.com',
    phone: '050-5544332',
    address: 'רחוב סוקולוב 8, הרצליה',
    created_at: new Date('2023-02-05'),
    status: 'active',
    total_orders: 4,
    total_spent: 2800,
    last_order_date: new Date('2023-03-20'),
  },
];

/**
 * Customers index page
 * Displays a list of customers with sorting, filtering, and pagination
 */
const CustomersPage = () => {
  const [activePath, setActivePath] = useState('/customers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [filterVisible, setFilterVisible] = useState(false);
  const [totalCount, setTotalCount] = useState(CUSTOMERS.length);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof typeof CUSTOMERS[0]>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Mock data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleCreateCustomer = () => {
    // Navigate to create customer page
    console.log('Navigate to create customer page');
  };

  const handleViewCustomer = (customer: typeof CUSTOMERS[0]) => {
    // Navigate to customer detail page
    console.log(`Navigate to customer detail page: ${customer.id}`);
  };

  const handleSortChange = (column: keyof typeof CUSTOMERS[0], direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    // In a real app, we would fetch sorted data from the API
  };

  const handleFilterChange = (filters: Record<string, any>) => {
    console.log('Filters changed:', filters);
    // In a real app, we would fetch filtered data from the API
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // In a real app, we would fetch the specified page from the API
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    // In a real app, we would fetch with the new page size from the API
  };

  const columns = [
    {
      header: 'שם',
      accessor: (customer: typeof CUSTOMERS[0]) => `${customer.first_name} ${customer.last_name}`,
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
    },
    {
      header: 'אימייל',
      accessor: 'email' as keyof typeof CUSTOMERS[0],
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
    },
    {
      header: 'טלפון',
      accessor: 'phone' as keyof typeof CUSTOMERS[0],
      sortable: false,
      filterable: true,
      filterType: 'text' as const,
    },
    {
      header: 'סטטוס',
      accessor: (customer: typeof CUSTOMERS[0]) => (
        <span className={`px-2 py-1 rounded-full text-xs ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {customer.status === 'active' ? 'פעיל' : 'לא פעיל'}
        </span>
      ),
      sortable: true,
      filterable: true,
      filterType: 'select' as const,
      filterOptions: [
        { value: 'active', label: 'פעיל' },
        { value: 'inactive', label: 'לא פעיל' },
      ],
    },
    {
      header: 'סה"כ הזמנות',
      accessor: 'total_orders' as keyof typeof CUSTOMERS[0],
      sortable: true,
      filterable: false,
    },
    {
      header: 'סה"כ קניות',
      accessor: (customer: typeof CUSTOMERS[0]) => `₪ ${customer.total_spent.toLocaleString()}`,
      sortable: true,
      filterable: false,
    },
    {
      header: 'הזמנה אחרונה',
      accessor: (customer: typeof CUSTOMERS[0]) => customer.last_order_date.toLocaleDateString('he-IL'),
      sortable: true,
      filterable: true,
      filterType: 'date' as const,
    },
  ];

  if (error) {
    return (
      <MainLayout
        sidebarItems={sidebarItems}
        activePath={activePath}
        userName="ישראל ישראלי"
        userRole="מנהל מערכת"
        userMenuItems={userMenuItems}
        logo={<Logo />}
        title="לקוחות"
        notifications={notifications}
        onNavigate={(path) => setActivePath(path)}
      >
        <Container>
          <Alert 
            type="error" 
            title="שגיאה בטעינת הנתונים"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      sidebarItems={sidebarItems}
      activePath={activePath}
      userName="ישראל ישראלי"
      userRole="מנהל מערכת"
      userMenuItems={userMenuItems}
      logo={<Logo />}
      title="לקוחות"
      notifications={notifications}
      onNavigate={(path) => setActivePath(path)}
    >
      {toast && (
        <Toast 
          type={toast.type} 
          message={toast.message} 
          onClose={() => setToast(null)}
        />
      )}

      <Container>
        <PageHeader 
          title="לקוחות" 
          description="ניהול לקוחות וצפייה בהיסטוריית הרכישות"
          actions={
            <button
              onClick={handleCreateCustomer}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              לקוח חדש
              <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          }
        />

        <DataGrid
          data={customers}
          columns={columns}
          isLoading={loading}
          emptyMessage="לא נמצאו לקוחות העונים לקריטריונים"
          pagination={{
            pageSize,
            totalCount,
            currentPage,
            onPageChange: handlePageChange,
            pageSizeOptions: [5, 10, 25, 50],
            onPageSizeChange: handlePageSizeChange,
          }}
          defaultSortColumn={sortColumn}
          defaultSortDirection={sortDirection}
          onSortChange={handleSortChange}
          onRowClick={handleViewCustomer}
          onFilterChange={handleFilterChange}
          filterVisible={filterVisible}
          onToggleFilters={() => setFilterVisible(!filterVisible)}
        />
      </Container>
    </MainLayout>
  );
};

export default CustomersPage; 