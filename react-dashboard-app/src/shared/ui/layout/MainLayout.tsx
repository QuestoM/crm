import React, { useState, ReactNode } from 'react';
import { useRtlDirection } from '../../utils/rtl';
import { RtlLayout } from './RtlLayout';
import { Navbar } from '../navigation/Navbar';
import { Sidebar } from '../navigation/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  sidebarItems: any[];
  activePath: string;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  userMenuItems?: any[];
  logo?: ReactNode;
  title?: string;
  notifications?: any[];
  onNotificationClick?: (id: string) => void;
  onAllNotificationsClick?: () => void;
  onSearch?: (query: string) => void;
  onNavigate?: (path: string) => void;
}

/**
 * Main layout component that combines Navbar and Sidebar
 * Provides the base layout structure for all pages
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  sidebarItems,
  activePath,
  userName,
  userRole,
  userAvatar,
  userMenuItems,
  logo,
  title,
  notifications,
  onNotificationClick,
  onAllNotificationsClick,
  onSearch,
  onNavigate,
}) => {
  const isRtl = useRtlDirection();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  return (
    <RtlLayout className="min-h-screen bg-gray-50">
      <Navbar
        title={title}
        logo={logo}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        userName={userName}
        userAvatar={userAvatar}
        userMenuItems={userMenuItems}
        notifications={notifications}
        onNotificationClick={onNotificationClick}
        onAllNotificationsClick={onAllNotificationsClick}
        onSearch={onSearch}
      />
      
      <Sidebar
        items={sidebarItems}
        activePath={activePath}
        logo={logo}
        userName={userName}
        userRole={userRole}
        userAvatar={userAvatar}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onNavigate={onNavigate}
      />
      
      <main 
        className={`
          transition-all duration-300 ease-in-out
          pt-16 pb-8
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
          ${isRtl ? 'lg:mr-64' : ''}
          ${isRtl && sidebarCollapsed ? 'lg:mr-20' : ''}
        `}
      >
        <div className="px-4 mx-auto max-w-full">
          {children}
        </div>
      </main>
    </RtlLayout>
  );
}; 