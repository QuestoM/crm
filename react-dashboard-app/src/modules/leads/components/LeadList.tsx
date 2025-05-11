import React, { useState, useEffect } from 'react';
import { useRtlDirection } from '../../../shared/utils/rtl';
import { Table } from '../../../shared/ui/data/Table';
import { Container } from '../../../shared/ui/layout/Container';
import { PageHeader } from '../../../shared/ui/layout/PageHeader';
import { Alert } from '../../../shared/ui/feedback/Alert';
import { Select } from '../../../shared/ui/forms/Select';
import { Input } from '../../../shared/ui/forms/Input';
import { Lead, LeadStatus } from '../domain/types';
import { LEAD_STATUS_DISPLAY } from '../domain/constants';

interface LeadListProps {
  isLoading?: boolean;
  error?: string;
  onCreateLead?: () => void;
  onViewLead?: (id: string) => void;
}

/**
 * LeadList component to display leads in a table
 * Includes filtering, sorting, and pagination
 */
export const LeadList: React.FC<LeadListProps> = ({
  isLoading = false,
  error,
  onCreateLead,
  onViewLead,
}) => {
  const isRtl = useRtlDirection();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<keyof Lead>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Mock data for demonstration
  useEffect(() => {
    const mockLeads: Lead[] = [
      {
        id: '1',
        first_name: 'דוד',
        last_name: 'כהן',
        email: 'david@example.com',
        phone_number: '052-1234567',
        status: LeadStatus.NEW,
        lead_source: 'אתר אינטרנט',
        created_at: new Date('2023-01-15'),
        updated_at: new Date('2023-01-15'),
      },
      {
        id: '2',
        first_name: 'שרה',
        last_name: 'לוי',
        email: 'sarah@example.com',
        phone_number: '053-7654321',
        status: LeadStatus.CONTACTED,
        lead_source: 'המלצה',
        created_at: new Date('2023-01-10'),
        updated_at: new Date('2023-01-12'),
      },
      {
        id: '3',
        first_name: 'יוסי',
        last_name: 'אברהם',
        email: 'yossi@example.com',
        phone_number: '054-9876543',
        status: LeadStatus.QUALIFIED,
        lead_source: 'פייסבוק',
        created_at: new Date('2023-01-05'),
        updated_at: new Date('2023-01-11'),
      }
    ];
    
    setLeads(mockLeads);
    setFilteredLeads(mockLeads);
  }, []);
  
  // Filter and sort leads
  useEffect(() => {
    let result = [...leads];
    
    // Apply status filter
    if (filterStatus) {
      result = result.filter(lead => lead.status === filterStatus);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(lead => 
        lead.first_name.toLowerCase().includes(query) ||
        lead.last_name.toLowerCase().includes(query) ||
        (lead.email?.toLowerCase() || '').includes(query) ||
        lead.phone_number.includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      // Handle date sorting
      if (sortColumn === 'created_at' || sortColumn === 'updated_at') {
        const aValue = a[sortColumn]?.getTime() || 0;
        const bValue = b[sortColumn]?.getTime() || 0;
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string sorting
      const aValue = String(a[sortColumn] || '');
      const bValue = String(b[sortColumn] || '');
      
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue, 'he')
        : bValue.localeCompare(aValue, 'he');
    });
    
    setFilteredLeads(result);
  }, [leads, filterStatus, searchQuery, sortColumn, sortDirection]);
  
  const handleSort = (column: keyof Lead, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
  };
  
  const statusOptions = Object.entries(LEAD_STATUS_DISPLAY).map(([value, label]) => ({
    value,
    label
  }));
  
  const columns = [
    {
      header: 'שם',
      accessor: (lead: Lead) => `${lead.first_name} ${lead.last_name}`,
      sortable: true,
    },
    {
      header: 'דוא"ל',
      accessor: 'email' as keyof Lead,
      sortable: true,
    },
    {
      header: 'טלפון',
      accessor: 'phone_number' as keyof Lead,
      sortable: false,
    },
    {
      header: 'סטטוס',
      accessor: (lead: Lead) => (
        <span className={`
          px-2 
          py-1 
          rounded-full 
          text-xs 
          ${lead.status === LeadStatus.NEW ? 'bg-blue-100 text-blue-800' : 
            lead.status === LeadStatus.CONTACTED ? 'bg-yellow-100 text-yellow-800' : 
            lead.status === LeadStatus.QUALIFIED ? 'bg-green-100 text-green-800' : 
            lead.status === LeadStatus.LOST ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'}
        `}>
          {LEAD_STATUS_DISPLAY[lead.status]}
        </span>
      ),
      sortable: true,
    },
    {
      header: 'מקור',
      accessor: 'lead_source' as keyof Lead,
      sortable: true,
    },
    {
      header: 'תאריך יצירה',
      accessor: (lead: Lead) => lead.created_at?.toLocaleDateString('he-IL'),
      sortable: true,
    },
  ];
  
  return (
    <Container>
      <PageHeader 
        title="ניהול לידים" 
        description="צפייה, עריכה וניהול של לידים במערכת"
        actions={
          <button
            onClick={onCreateLead}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ליד חדש
            <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        }
      />
      
      {error && (
        <Alert type="error" title="שגיאה בטעינת הנתונים">
          {error}
        </Alert>
      )}
      
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="w-full md:w-auto flex-grow">
          <Input
            label="חיפוש"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש לפי שם, אימייל או טלפון..."
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            label="סינון לפי סטטוס"
            options={[
              { value: '', label: 'כל הסטטוסים' },
              ...statusOptions
            ]}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <Table
          data={filteredLeads}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="לא נמצאו לידים העונים לקריטריונים"
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={(lead) => onViewLead && onViewLead(lead.id)}
        />
      </div>
    </Container>
  );
}; 