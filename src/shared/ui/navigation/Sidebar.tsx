import React, { useState } from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  count?: number;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  activePath: string;
  logo?: React.ReactNode;
  onNavigate?: (href: string) => void;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/**
 * Responsive sidebar navigation with RTL support
 * Includes collapsible sections, badges, and mobile responsiveness
 */
export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activePath,
  logo,
  onNavigate,
  userName,
  userRole,
  userAvatar,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}) => {
  const isRtl = useRtlDirection();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  const handleItemClick = (item: SidebarItem, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    if (item.children?.length) {
      setExpandedItems(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
      return;
    }
    
    if (onNavigate) {
      onNavigate(item.href);
    }
    
    // Close mobile sidebar when item is clicked
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  };
  
  const isActive = (path: string) => {
    return activePath === path || activePath.startsWith(`${path}/`);
  };
  
  const renderItem = (item: SidebarItem, depth = 0) => {
    const active = isActive(item.href);
    const expanded = expandedItems[item.id];
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <li key={item.id} className={depth > 0 ? 'mr-4' : ''}>
        <a
          href={item.href}
          className={`
            flex items-center px-4 py-2 my-1 text-sm rounded-md
            transition-colors duration-150 
            ${active 
              ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'text-gray-600 hover:bg-gray-100'
            }
            ${collapsed && depth === 0 ? 'justify-center' : ''}
          `}
          onClick={(e) => handleItemClick(item, e)}
        >
          <span className="flex-shrink-0 w-6 h-6">{item.icon}</span>
          
          {(!collapsed || depth > 0) && (
            <>
              <span className={`${isRtl ? 'mr-3' : 'ml-3'} flex-grow whitespace-nowrap`}>
                {item.label}
              </span>
              
              {item.count !== undefined && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                  {item.count}
                </span>
              )}
              
              {hasChildren && (
                <svg
                  className={`w-4 h-4 ${isRtl ? 'mr-1' : 'ml-1'} ${expanded ? 'transform rotate-90' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d={isRtl 
                      ? "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      : "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    }
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </>
          )}
        </a>
        
        {hasChildren && expanded && !collapsed && (
          <ul className={`mt-1 ${isRtl ? 'pr-4' : 'pl-4'} border-${isRtl ? 'r' : 'l'} border-gray-200`}>
            {item.children.map(child => renderItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };
  
  // Overlay for mobile view
  const mobileOverlay = mobileOpen && (
    <div 
      className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
      onClick={onMobileClose}
    />
  );
  
  return (
    <>
      {mobileOverlay}
      
      <aside
        className={`
          ${mobileOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'}
          ${collapsed ? 'w-20' : 'w-64'}
          fixed top-0 ${isRtl ? 'right-0' : 'left-0'} z-50
          h-full bg-white border-${isRtl ? 'l' : 'r'} border-gray-200
          transition-all duration-300 ease-in-out
          flex flex-col
          lg:translate-x-0
        `}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {logo && !collapsed && (
            <div className="flex-shrink-0">
              {logo}
            </div>
          )}
          
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className={`${collapsed ? 'mx-auto' : ''} text-gray-500 hover:text-gray-700`}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={collapsed 
                    ? (isRtl ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7M19 19l-7-7 7-7") 
                    : (isRtl ? "M11 19l-7-7 7-7M19 19l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7")
                  }
                />
              </svg>
            </button>
          )}
          
          {onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul>
            {items.map(item => renderItem(item))}
          </ul>
        </nav>
        
        {userName && !collapsed && (
          <div className="flex items-center p-4 border-t border-gray-200">
            {userAvatar && (
              <img
                className="w-10 h-10 rounded-full mr-3"
                src={userAvatar}
                alt={userName}
              />
            )}
            <div>
              <p className="text-sm font-medium text-gray-700">{userName}</p>
              {userRole && (
                <p className="text-xs text-gray-500">{userRole}</p>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}; 