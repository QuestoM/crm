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
import { Input } from '../../shared/ui/inputs/Input';
import { Select } from '../../shared/ui/inputs/Select';
import { Modal } from '../../shared/ui/overlay/Modal';
import { Form } from '../../shared/ui/inputs/Form';
import { 
  getLeads, 
  createLead,
  deleteLead,
  convertLeadToCustomer,
  LeadFilters, 
  Lead
} from '../../services/api/leadsService';

// Lead status and source options
const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'חדש' },
  { value: 'contacted', label: 'נוצר קשר' },
  { value: 'qualified', label: 'מתעניין' },
  { value: 'lost', label: 'אבוד' },
  { value: 'converted', label: 'הומר ללקוח' },
];

const LEAD_SOURCE_OPTIONS = [
  { value: 'website', label: 'אתר' },
  { value: 'referral', label: 'הפניה' },
  { value: 'advertisement', label: 'פרסום' },
  { value: 'direct', label: 'ישיר' },
  { value: 'social', label: 'רשתות חברתיות' },
];

// Status badge variants
const statusVariants: Record<string, string> = {
  new: 'info',
  contacted: 'primary',
  qualified: 'success',
  lost: 'error',
  converted: 'warning',
};

/**
 * Form for creating or editing a lead
 */
interface LeadFormProps {
  initialValues?: Partial<Lead>;
  onSubmit: (values: Omit<Lead, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ 
  initialValues = {}, 
  onSubmit, 
  onCancel,
  isLoading = false
}) => {
  const [formValues, setFormValues] = useState<Partial<Lead>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'website',
    status: 'new',
    ...initialValues
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formValues.name?.trim()) {
      newErrors.name = 'שם הוא שדה חובה';
    }
    
    if (!formValues.email?.trim()) {
      newErrors.email = 'אימייל הוא שדה חובה';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      newErrors.email = 'אימייל לא תקין';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formValues as Omit<Lead, 'id' | 'created_at'>);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Form.Field
          label="שם"
          htmlFor="name"
          error={errors.name}
          required
        >
          <Input
            id="name"
            name="name"
            value={formValues.name || ''}
            onChange={handleChange}
            placeholder="שם מלא"
            disabled={isLoading}
          />
        </Form.Field>
        
        <Form.Field
          label="אימייל"
          htmlFor="email"
          error={errors.email}
          required
        >
          <Input
            id="email"
            name="email"
            type="email"
            value={formValues.email || ''}
            onChange={handleChange}
            placeholder="email@example.com"
            disabled={isLoading}
          />
        </Form.Field>
        
        <Form.Field
          label="טלפון"
          htmlFor="phone"
          error={errors.phone}
        >
          <Input
            id="phone"
            name="phone"
            value={formValues.phone || ''}
            onChange={handleChange}
            placeholder="05X-XXXXXXX"
            disabled={isLoading}
          />
        </Form.Field>
        
        <Form.Field
          label="חברה"
          htmlFor="company"
        >
          <Input
            id="company"
            name="company"
            value={formValues.company || ''}
            onChange={handleChange}
            placeholder="שם החברה (אופציונלי)"
            disabled={isLoading}
          />
        </Form.Field>
        
        <Form.Field
          label="מקור"
          htmlFor="source"
        >
          <Select
            id="source"
            name="source"
            value={formValues.source || ''}
            onChange={handleChange}
            options={LEAD_SOURCE_OPTIONS}
            disabled={isLoading}
          />
        </Form.Field>
        
        <Form.Field
          label="סטטוס"
          htmlFor="status"
        >
          <Select
            id="status"
            name="status"
            value={formValues.status || ''}
            onChange={handleChange}
            options={LEAD_STATUS_OPTIONS}
            disabled={isLoading}
          />
        </Form.Field>
        
        <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {initialValues.id ? 'עדכון ליד' : 'יצירת ליד'}
          </Button>
        </div>
      </div>
    </Form>
  );
};

/**
 * Leads page component
 */
const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'info' | 'warning'} | null>(null);
  const [totalLeads, setTotalLeads] = useState(0);
  
  // Create lead modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Lead search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Load leads data
  useEffect(() => {
    async function loadLeads() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Combine filters
        const combinedFilters: LeadFilters = {
          ...filtering.filters,
          ...(searchTerm ? { search: searchTerm } : {}),
        };
        
        const response = await getLeads(
          pagination.currentPage,
          pagination.pageSize,
          combinedFilters,
          sorting.sortColumn,
          sorting.sortDirection
        );
        
        if (response.success && response.data) {
          setLeads(response.data.leads);
          setTotalLeads(response.data.total);
          setPagination(prev => ({ ...prev, totalCount: response.data.total }));
        } else {
          setError(response.error?.message || 'Failed to load leads');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadLeads();
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
  
  // Handle lead deletion
  const handleDeleteLead = async (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק ליד זה? פעולה זו לא ניתנת לביטול.')) {
      try {
        const response = await deleteLead(id);
        
        if (response.success) {
          setToast({ message: 'הליד נמחק בהצלחה', type: 'success' });
          // Update local state
          setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
          setTotalLeads(prev => prev - 1);
        } else {
          setToast({ message: response.error?.message || 'שגיאה במחיקת הליד', type: 'error' });
        }
      } catch (err) {
        setToast({ 
          message: err instanceof Error ? err.message : 'שגיאה במחיקת הליד', 
          type: 'error' 
        });
      }
    }
  };
  
  // Handle lead conversion
  const handleConvertLead = async (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך להמיר ליד זה ללקוח?')) {
      try {
        const response = await convertLeadToCustomer(id);
        
        if (response.success && response.data) {
          setToast({ message: 'הליד הומר ללקוח בהצלחה', type: 'success' });
          
          // Update local state - update status to converted
          setLeads(prevLeads => 
            prevLeads.map(lead => 
              lead.id === id ? { ...lead, status: 'converted' } : lead
            )
          );
          
          // Navigate to the new customer page after a short delay
          setTimeout(() => {
            navigate(`/customers/${response.data.customerId}`);
          }, 1500);
        } else {
          setToast({ message: response.error?.message || 'שגיאה בהמרת הליד ללקוח', type: 'error' });
        }
      } catch (err) {
        setToast({ 
          message: err instanceof Error ? err.message : 'שגיאה בהמרת הליד ללקוח', 
          type: 'error' 
        });
      }
    }
  };
  
  // Handle create lead form submission
  const handleCreateLead = async (leadData: Omit<Lead, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    
    try {
      const response = await createLead(leadData);
      
      if (response.success && response.data) {
        setToast({ message: 'הליד נוצר בהצלחה', type: 'success' });
        setIsCreateModalOpen(false);
        
        // Add the new lead to the list if it would appear on the current page
        setLeads(prevLeads => [response.data, ...prevLeads].slice(0, pagination.pageSize));
        setTotalLeads(prev => prev + 1);
      } else {
        setToast({ message: response.error?.message || 'שגיאה ביצירת הליד', type: 'error' });
      }
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'שגיאה ביצירת הליד', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Lead grid columns
  const columns = [
    {
      header: 'שם',
      accessor: (lead: Lead) => (
        <div>
          <div className="font-semibold">{lead.name}</div>
          <div className="text-xs text-gray-500">{lead.email}</div>
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
      header: 'חברה',
      accessor: 'company',
      sortable: true,
      filterable: true,
    },
    {
      header: 'מקור',
      accessor: (lead: Lead) => {
        const source = LEAD_SOURCE_OPTIONS.find(s => s.value === lead.source)?.label || lead.source;
        return <span>{source}</span>;
      },
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: LEAD_SOURCE_OPTIONS,
    },
    {
      header: 'סטטוס',
      accessor: (lead: Lead) => {
        const status = LEAD_STATUS_OPTIONS.find(s => s.value === lead.status)?.label || lead.status;
        return (
          <Badge variant={statusVariants[lead.status] || 'default'}>
            {status}
          </Badge>
        );
      },
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: LEAD_STATUS_OPTIONS,
    },
    {
      header: 'תאריך יצירה',
      accessor: (lead: Lead) => 
        new Date(lead.created_at).toLocaleDateString('he-IL'),
      sortable: true,
    },
    {
      header: 'פעולות',
      accessor: (lead: Lead) => (
        <div className="flex space-x-2 rtl:space-x-reverse">
          {lead.status !== 'converted' && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleConvertLead(lead.id);
              }}
            >
              המר ללקוח
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/leads/${lead.id}`);
            }}
          >
            ערוך
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteLead(lead.id);
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
          title={toast.type === 'error' ? 'שגיאה' : 'הודעה'}
          type={toast.type}
          onClose={() => setToast(null)}
        >
          {toast.message}
        </Toast>
      )}
      
      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        title="יצירת ליד חדש"
      >
        <LeadForm
          onSubmit={handleCreateLead}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
      
      <PageHeader
        title="ניהול לידים"
        description={`סה"כ ${totalLeads} לידים במערכת`}
        actions={[
          <Button
            key="add-lead"
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            ליד חדש
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
                placeholder="חיפוש לפי שם, אימייל, חברה..."
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
                  { value: 'created_at', label: 'תאריך יצירה' },
                  { value: 'name', label: 'שם' },
                  { value: 'company', label: 'חברה' },
                  { value: 'status', label: 'סטטוס' },
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
          data={leads}
          isLoading={isLoading}
          emptyMessage="לא נמצאו לידים התואמים את החיפוש"
          pagination={pagination}
          sorting={sorting}
          filtering={filtering}
          onRowClick={(lead) => navigate(`/leads/${lead.id}`)}
        />
      )}
    </MainLayout>
  );
};

export default LeadsPage; 