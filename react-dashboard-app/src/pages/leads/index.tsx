import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../shared/ui/layout/MainLayout';
import { Container } from '../../shared/ui/layout/Container';
import { LeadList } from '../../modules/leads/components/LeadList';
import { sidebarItems, userMenuItems, notifications } from '../../shared/data/mockData.tsx';
import { Lead, LeadStatus } from '../../modules/leads/domain/types';
import { LEAD_SOURCES } from '../../modules/leads/domain/constants';
import { Alert } from '../../shared/ui/feedback/Alert';
import { Toast } from '../../shared/ui/feedback/Toast';
import { Logo } from '../../shared/components/Logo';

/**
 * Leads index page component
 * Displays a list of leads with filtering, sorting, and pagination
 */
const LeadsPage = () => {
  const [activePath, setActivePath] = useState('/leads');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  
  // Mock data loading
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleCreateLead = () => {
    // Navigate to create lead page
    console.log('Navigate to create lead page');
  };
  
  const handleViewLead = (id: string) => {
    // Navigate to lead detail page
    console.log(`Navigate to lead detail page: ${id}`);
  };
  
  if (error) {
    return (
      <MainLayout
        sidebarItems={sidebarItems}
        activePath={activePath}
        userName="ישראל ישראלי"
        userRole="מנהל מערכת"
        userMenuItems={userMenuItems}
        logo={<Logo />}
        title="לידים"
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
      title="לידים"
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
      
      <LeadList
        isLoading={loading}
        onCreateLead={handleCreateLead}
        onViewLead={handleViewLead}
      />
    </MainLayout>
  );
};

export default LeadsPage; 