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
  getProducts, 
  ProductFilters, 
  Product,
  deleteProduct
} from '../../services/api/productsService';

// Product category options - for water filter business
const PRODUCT_CATEGORIES = [
  { value: 'filter', label: 'מסנני מים' },
  { value: 'purifier', label: 'מטהרי מים' },
  { value: 'softener', label: 'מרככי מים' },
  { value: 'cartridge', label: 'מחסניות החלפה' },
  { value: 'accessory', label: 'אביזרים' },
  { value: 'maintenance', label: 'ערכות תחזוקה' },
];

/**
 * Products management page component
 */
const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  
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
    sortColumn: 'name',
    sortDirection: 'asc',
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
  
  // Product search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Load products data
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Combine filters
        const combinedFilters: ProductFilters = {
          ...filtering.filters,
          ...(searchTerm ? { search: searchTerm } : {}),
        };
        
        const response = await getProducts(
          pagination.currentPage,
          pagination.pageSize,
          combinedFilters,
          sorting.sortColumn,
          sorting.sortDirection
        );
        
        if (response.success && response.data) {
          setProducts(response.data.products);
          setTotalProducts(response.data.total);
          setPagination(prev => ({ ...prev, totalCount: response.data.total }));
        } else {
          setError(response.error?.message || 'Failed to load products');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadProducts();
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
  
  // Handle product deletion
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה? פעולה זו לא ניתנת לביטול.')) {
      try {
        const response = await deleteProduct(id);
        
        if (response.success) {
          setToast({ message: 'המוצר נמחק בהצלחה', type: 'success' });
          // Reload products
          setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
          setTotalProducts(prev => prev - 1);
        } else {
          setToast({ message: response.error?.message || 'שגיאה במחיקת המוצר', type: 'error' });
        }
      } catch (err) {
        setToast({ 
          message: err instanceof Error ? err.message : 'שגיאה במחיקת המוצר', 
          type: 'error' 
        });
      }
    }
  };
  
  // Get category label
  const getCategoryLabel = (category: string) => {
    return PRODUCT_CATEGORIES.find(c => c.value === category)?.label || category;
  };
  
  // Product grid columns
  const columns = [
    {
      header: 'מוצר',
      accessor: (product: Product) => (
        <div className="flex items-center">
          {product.image_url && (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-10 h-10 object-cover rounded-md mr-3 rtl:mr-0 rtl:ml-3" 
            />
          )}
          <div>
            <div className="font-semibold">{product.name}</div>
            <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
          </div>
        </div>
      ),
      sortable: true,
      filterable: true,
    },
    {
      header: 'קטגוריה',
      accessor: (product: Product) => (
        <span>{getCategoryLabel(product.category)}</span>
      ),
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: PRODUCT_CATEGORIES,
    },
    {
      header: 'מחיר',
      accessor: (product: Product) => (
        <span className="font-medium">
          ₪{product.price.toLocaleString('he-IL')}
        </span>
      ),
      sortable: true,
      filterable: true,
      filterType: 'number',
    },
    {
      header: 'מלאי',
      accessor: (product: Product) => (
        <div>
          <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : ''}`}>
            {product.stock}
          </span>
          {product.stock === 0 && (
            <Badge variant="error" size="sm" className="mr-2 rtl:mr-0 rtl:ml-2">
              אזל מהמלאי
            </Badge>
          )}
          {product.stock < 5 && product.stock > 0 && (
            <Badge variant="warning" size="sm" className="mr-2 rtl:mr-0 rtl:ml-2">
              מלאי נמוך
            </Badge>
          )}
        </div>
      ),
      sortable: true,
      filterable: true,
      filterType: 'number',
    },
    {
      header: 'סטטוס',
      accessor: (product: Product) => (
        <Badge 
          variant={product.is_active ? 'success' : 'error'}
          size="sm"
        >
          {product.is_active ? 'פעיל' : 'לא פעיל'}
        </Badge>
      ),
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'true', label: 'פעיל' },
        { value: 'false', label: 'לא פעיל' },
      ],
    },
    {
      header: 'תאריך יצירה',
      accessor: (product: Product) => 
        new Date(product.created_at).toLocaleDateString('he-IL'),
      sortable: true,
    },
    {
      header: 'פעולות',
      accessor: (product: Product) => (
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product.id}`);
            }}
          >
            ערוך
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProduct(product.id);
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
        title="ניהול מוצרים"
        description={`סה"כ ${totalProducts} מוצרים במערכת`}
        actions={[
          <Button
            key="add-product"
            variant="primary"
            onClick={() => navigate('/products/new')}
          >
            מוצר חדש
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
                placeholder="חיפוש לפי שם, תיאור..."
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
                  { value: 'name', label: 'שם מוצר' },
                  { value: 'price', label: 'מחיר' },
                  { value: 'stock', label: 'מלאי' },
                  { value: 'category', label: 'קטגוריה' },
                  { value: 'created_at', label: 'תאריך יצירה' },
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
                  { value: 'asc', label: 'סדר עולה' },
                  { value: 'desc', label: 'סדר יורד' },
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
          data={products}
          isLoading={isLoading}
          emptyMessage="לא נמצאו מוצרים התואמים את החיפוש"
          pagination={pagination}
          sorting={sorting}
          filtering={filtering}
          onRowClick={(product) => navigate(`/products/${product.id}`)}
        />
      )}
    </MainLayout>
  );
};

export default ProductsPage; 