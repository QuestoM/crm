import React, { useState, ReactNode, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useRtlDirection } from './shared/utils/rtl'; // Corrected path
import { RtlLayout } from './shared/ui/layout/RtlLayout'; // Adjusted path
import { Navbar } from './shared/ui/navigation/Navbar'; // Adjusted path
import { Sidebar } from './shared/ui/navigation/Sidebar'; // Adjusted path
import { SupabaseStatus } from './shared/components/SupabaseStatus'; // Import the SupabaseStatus component

// Placeholder Icons
const HomeIcon = () => <span>🏠</span>;
const UsersIcon = () => <span>👥</span>;
const BriefcaseIcon = () => <span>💼</span>;
const DatabaseIcon = () => <span>🗄️</span>;

interface MainLayoutProps {
  children: ReactNode;
}

// Mock data (replace with actual data fetching or context)
const mockSidebarItems = [
  { path: '/', label: 'לוח בקרה', icon: <HomeIcon /> },
  { path: '/leads', label: 'לידים', icon: <BriefcaseIcon /> },
  { path: '/customers', label: 'לקוחות', icon: <UsersIcon /> },
  // Admin section
  { 
    path: '/admin', // Add a path for the parent item
    label: 'ניהול מערכת',
    icon: <DatabaseIcon />, // Add an icon for the parent item
    children: [
      { path: '/admin/database', label: 'מצב מסד נתונים', icon: <DatabaseIcon /> },
    ]
  },
  // Add more items as needed
];

const mockUserMenuItems = [
  { label: 'פרופיל', onClick: () => console.log('Profile clicked') },
  { label: 'הגדרות', onClick: () => console.log('Settings clicked') },
  { label: 'התנתק', onClick: () => console.log('Logout clicked') },
];

// Corrected mock notification structure
const mockNotifications = [
  { id: '1', title: 'פנייה חדשה', message: 'לקוח חדש נרשם דרך האתר', time: 'לפני 5 דקות', read: false },
  { id: '2', title: 'תזכורת שירות', message: 'החלפת מסנן ללקוח ישראל ישראלי', time: 'לפני שעה', read: true },
];

/**
 * Main layout component that combines Navbar and Sidebar
 * Provides the base layout structure for all pages
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isRtl = useRtlDirection();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activePath, setActivePath] = useState(location.pathname);

  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
    setMobileSidebarOpen(false);
  };
  
  return (
    <RtlLayout className="min-h-screen bg-gray-50">
      <Navbar
        title="מערכת CRM"
        logo={<Link to="/" className="font-bold text-lg text-blue-600">מסנני מים</Link>}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        userName="ישראל ישראלי"
        userMenuItems={mockUserMenuItems}
        notifications={mockNotifications}
        onNotificationClick={(id) => console.log(`Notification ${id} clicked`)}
        onAllNotificationsClick={() => console.log('View all notifications')}
        onSearch={(query) => console.log(`Search for: ${query}`)}
      />
      
      <Sidebar
        items={mockSidebarItems}
        activePath={activePath}
        logo={<span className="font-bold text-lg">מסנני מים</span>}
        userName="ישראל ישראלי"
        userRole="מנהל"
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onNavigate={handleNavigate}
      />
      
      <main 
        className={`
          transition-all duration-300 ease-in-out
          pt-16 pb-8 
          ${isRtl 
            ? (sidebarCollapsed ? 'lg:mr-20' : 'lg:mr-64') 
            : (sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64')}
        `}
      >
        <div className="px-4 mx-auto max-w-full">
          {children} 
        </div>
        
        {/* Supabase connection status */}
        <div className="fixed bottom-4 right-4 bg-white p-2 rounded-md shadow-md z-10">
          <SupabaseStatus showDetails={false} />
        </div>
      </main>
    </RtlLayout>
  );
}; 