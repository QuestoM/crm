import React, { useState } from 'react';
import { useRtlDirection } from '../../../shared/utils/rtl';
import { Container } from '../../../shared/ui/layout/Container';
import { PageHeader } from '../../../shared/ui/layout/PageHeader';
import { Input } from '../../../shared/ui/forms/Input';
import { Select } from '../../../shared/ui/forms/Select';
import { Alert } from '../../../shared/ui/feedback/Alert';
import { Lead, LeadStatus } from '../domain/types';
import { LEAD_STATUS_DISPLAY, LEAD_SOURCES } from '../domain/constants';

interface LeadFormProps {
  lead?: Partial<Lead>;
  isLoading?: boolean;
  error?: string;
  onSubmit: (data: Partial<Lead>) => void;
  onCancel?: () => void;
  isEditMode?: boolean;
}

/**
 * LeadForm component for creating and editing leads
 * Includes validation and RTL support
 */
export const LeadForm: React.FC<LeadFormProps> = ({
  lead,
  isLoading = false,
  error,
  onSubmit,
  onCancel,
  isEditMode = false,
}) => {
  const isRtl = useRtlDirection();
  const [formData, setFormData] = useState<Partial<Lead>>(lead || {});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is changed
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.first_name) {
      errors.first_name = 'שדה חובה';
    }
    
    if (!formData.last_name) {
      errors.last_name = 'שדה חובה';
    }
    
    if (!formData.phone_number) {
      errors.phone_number = 'שדה חובה';
    } else if (!/^0[2-9]\d{7,8}$/.test(formData.phone_number)) {
      errors.phone_number = 'מספר טלפון לא תקין';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'כתובת דוא"ל לא תקינה';
    }
    
    if (!formData.lead_source) {
      errors.lead_source = 'שדה חובה';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  const statusOptions = Object.entries(LEAD_STATUS_DISPLAY).map(([value, label]) => ({
    value,
    label
  }));
  
  const sourceOptions = LEAD_SOURCES.map((source) => ({
    value: source,
    label: source
  }));
  
  return (
    <Container>
      <PageHeader 
        title={isEditMode ? 'עריכת ליד' : 'יצירת ליד חדש'} 
        description={isEditMode ? 'עדכון פרטי הליד במערכת' : 'הוספת ליד חדש למערכת'}
        backLink={{ href: '/leads', label: 'חזרה לרשימת הלידים' }}
      />
      
      {error && (
        <Alert type="error" title="שגיאה בשמירת הנתונים">
          {error}
        </Alert>
      )}
      
      <div className="bg-white shadow overflow-hidden rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="שם פרטי"
              name="first_name"
              value={formData.first_name || ''}
              onChange={handleChange}
              required
              error={validationErrors.first_name}
              disabled={isLoading}
            />
            
            <Input
              label="שם משפחה"
              name="last_name"
              value={formData.last_name || ''}
              onChange={handleChange}
              required
              error={validationErrors.last_name}
              disabled={isLoading}
            />
            
            <Input
              label="דוא״ל"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              error={validationErrors.email}
              disabled={isLoading}
            />
            
            <Input
              label="טלפון"
              name="phone_number"
              type="tel"
              value={formData.phone_number || ''}
              onChange={handleChange}
              required
              error={validationErrors.phone_number}
              disabled={isLoading}
              placeholder="05xxxxxxxx"
            />
            
            <Select
              label="מקור"
              name="lead_source"
              options={sourceOptions}
              value={formData.lead_source || ''}
              onChange={handleChange}
              required
              error={validationErrors.lead_source}
              disabled={isLoading}
            />
            
            {isEditMode && (
              <Select
                label="סטטוס"
                name="status"
                options={statusOptions}
                value={formData.status || LeadStatus.NEW}
                onChange={handleChange}
                disabled={isLoading}
              />
            )}
          </div>
          
          <div className={`mt-8 flex ${isRtl ? 'justify-start' : 'justify-end'} gap-4`}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                ביטול
              </button>
            )}
            
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? 'שומר...' : isEditMode ? 'עדכון' : 'שמירה'}
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
}; 