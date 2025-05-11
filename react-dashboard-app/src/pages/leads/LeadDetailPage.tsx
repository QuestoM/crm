import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../AppLayout';
import { PageHeader } from '../../shared/ui/layout/PageHeader';
import { Button } from '../../shared/ui/inputs/Button';
import { Card } from '../../shared/ui/data-display/Card';
import { Alert } from '../../shared/ui/feedback/Alert';
import { Toast } from '../../shared/ui/feedback/Toast';
import { Loader } from '../../shared/ui/feedback/Loader';
import { Badge } from '../../shared/ui/data-display/Badge';
import { Form } from '../../shared/ui/inputs/Form';
import { Input } from '../../shared/ui/inputs/Input';
import { Select } from '../../shared/ui/inputs/Select';
import { Modal } from '../../shared/ui/overlay/Modal';
import {
  getLead,
  updateLead,
  deleteLead,
  convertLeadToCustomer,
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
 * Lead detail page component
 */
const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Lead data
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'info' | 'warning'} | null>(null);
  
  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<Partial<Lead>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Convert confirmation modal
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  
  // Load lead data
  useEffect(() => {
    async function loadLead() {
      if (!id) {
        setError('ליד לא נמצא');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await getLead(id);
        
        if (response.success && response.data) {
          setLead(response.data);
          setFormValues(response.data);
        } else {
          setError(response.error?.message || 'שגיאה בטעינת הליד');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadLead();
  }, [id]);
  
  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form
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
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !id) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Remove id and created_at from form values
      const { id: _, created_at: __, ...updateData } = formValues;
      
      const response = await updateLead(id, updateData);
      
      if (response.success && response.data) {
        setLead(response.data);
        setIsEditing(false);
        setToast({ message: 'ליד עודכן בהצלחה', type: 'success' });
      } else {
        setToast({ message: response.error?.message || 'שגיאה בעדכון ליד', type: 'error' });
      }
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'שגיאה בעדכון ליד', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle lead deletion
  const handleDeleteLead = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      const response = await deleteLead(id);
      
      if (response.success) {
        setToast({ message: 'ליד נמחק בהצלחה', type: 'success' });
        setIsDeleteModalOpen(false);
        
        // Navigate back to leads list after a short delay
        setTimeout(() => {
          navigate('/leads');
        }, 1500);
      } else {
        setIsDeleteModalOpen(false);
        setToast({ message: response.error?.message || 'שגיאה במחיקת ליד', type: 'error' });
      }
    } catch (err) {
      setIsDeleteModalOpen(false);
      setToast({ 
        message: err instanceof Error ? err.message : 'שגיאה במחיקת ליד', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle lead conversion
  const handleConvertLead = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      const response = await convertLeadToCustomer(id);
      
      if (response.success && response.data) {
        setToast({ message: 'ליד הומר ללקוח בהצלחה', type: 'success' });
        setIsConvertModalOpen(false);
        
        // Update lead status in the UI
        if (lead) {
          setLead({ ...lead, status: 'converted' });
        }
        
        // Navigate to the new customer page after a short delay
        setTimeout(() => {
          navigate(`/customers/${response.data.customerId}`);
        }, 1500);
      } else {
        setIsConvertModalOpen(false);
        setToast({ message: response.error?.message || 'שגיאה בהמרת ליד ללקוח', type: 'error' });
      }
    } catch (err) {
      setIsConvertModalOpen(false);
      setToast({ 
        message: err instanceof Error ? err.message : 'שגיאה בהמרת ליד ללקוח', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormValues(lead || {});
    setFormErrors({});
  };
  
  // Get status label
  const getStatusLabel = (status: string) => {
    return LEAD_STATUS_OPTIONS.find(option => option.value === status)?.label || status;
  };
  
  // Get source label
  const getSourceLabel = (source: string) => {
    return LEAD_SOURCE_OPTIONS.find(option => option.value === source)?.label || source;
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      </MainLayout>
    );
  }
  
  if (error || !lead) {
    return (
      <MainLayout>
        <Alert type="error" title="שגיאה בטעינת הליד">
          {error || 'ליד לא נמצא'}
        </Alert>
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/leads')}
          >
            חזרה לרשימת הלידים
          </Button>
        </div>
      </MainLayout>
    );
  }

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
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="מחיקת ליד"
      >
        <div className="space-y-4">
          <p>האם אתה בטוח שברצונך למחוק את הליד: <strong>{lead.name}</strong>?</p>
          <p className="text-red-600 text-sm">פעולה זו לא ניתנת לביטול.</p>
          
          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
            <Button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              variant="secondary"
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button
              type="button"
              onClick={handleDeleteLead}
              variant="danger"
              isLoading={isSubmitting}
            >
              מחק ליד
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Convert Confirmation Modal */}
      <Modal
        isOpen={isConvertModalOpen}
        onClose={() => !isSubmitting && setIsConvertModalOpen(false)}
        title="המרת ליד ללקוח"
      >
        <div className="space-y-4">
          <p>האם אתה בטוח שברצונך להמיר את הליד <strong>{lead.name}</strong> ללקוח חדש?</p>
          
          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
            <Button
              type="button"
              onClick={() => setIsConvertModalOpen(false)}
              variant="secondary"
              disabled={isSubmitting}
            >
              ביטול
            </Button>
            <Button
              type="button"
              onClick={handleConvertLead}
              variant="primary"
              isLoading={isSubmitting}
              disabled={lead.status === 'converted'}
            >
              המר ללקוח
            </Button>
          </div>
        </div>
      </Modal>
      
      <PageHeader
        title={`ליד: ${lead.name}`}
        description={lead.company ? `${lead.company}` : undefined}
        actions={[
          <Button
            key="back"
            variant="secondary"
            onClick={() => navigate('/leads')}
          >
            חזרה לרשימה
          </Button>,
          lead.status !== 'converted' && (
            <Button
              key="convert"
              variant="warning"
              onClick={() => setIsConvertModalOpen(true)}
            >
              המר ללקוח
            </Button>
          ),
          <Button
            key="delete"
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            מחק
          </Button>,
          !isEditing && (
            <Button
              key="edit"
              variant="primary"
              onClick={() => setIsEditing(true)}
            >
              ערוך
            </Button>
          )
        ]}
      />
      
      <Card className="p-6">
        {isEditing ? (
          // Edit form
          <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Form.Field
                label="שם"
                htmlFor="name"
                error={formErrors.name}
                required
              >
                <Input
                  id="name"
                  name="name"
                  value={formValues.name || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </Form.Field>
              
              <Form.Field
                label="אימייל"
                htmlFor="email"
                error={formErrors.email}
                required
              >
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formValues.email || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </Form.Field>
              
              <Form.Field
                label="טלפון"
                htmlFor="phone"
              >
                <Input
                  id="phone"
                  name="phone"
                  value={formValues.phone || ''}
                  onChange={handleChange}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting || formValues.status === 'converted'}
                />
              </Form.Field>
              
              <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  variant="secondary"
                  disabled={isSubmitting}
                >
                  ביטול
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                >
                  שמור שינויים
                </Button>
              </div>
            </div>
          </Form>
        ) : (
          // View mode - details display
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{lead.name}</h2>
                {lead.company && (
                  <p className="text-gray-600">{lead.company}</p>
                )}
              </div>
              <Badge variant={statusVariants[lead.status] || 'default'}>
                {getStatusLabel(lead.status)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-500">פרטי קשר</h3>
                <div className="mt-2 space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">אימייל:</span>
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                      {lead.email}
                    </a>
                  </p>
                  {lead.phone && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">טלפון:</span>
                      <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                        {lead.phone}
                      </a>
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">פרטים נוספים</h3>
                <div className="mt-2 space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">מקור:</span>
                    <span>{getSourceLabel(lead.source)}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">תאריך יצירה:</span>
                    <span>{new Date(lead.created_at).toLocaleDateString('he-IL')}</span>
                  </p>
                </div>
              </div>
            </div>
            
            {lead.status === 'converted' && (
              <Alert type="warning" title="ליד הומר ללקוח">
                ליד זה כבר הומר ללקוח במערכת. אין אפשרות לערוך את הסטטוס.
              </Alert>
            )}
          </div>
        )}
      </Card>
    </MainLayout>
  );
};

export default LeadDetailPage; 