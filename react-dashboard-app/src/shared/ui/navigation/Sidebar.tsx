import React from 'react';
import { useRtlDirection } from '../../utils/rtl';
import { Link } from 'react-router-dom'; // Assuming usage of React Router

// Placeholder Icons
const HomeIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const BriefcaseIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ChevronDownIcon = () => <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const ChevronLeftIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

interface SidebarItem {
  path: string;
  label: string;
  icon?: React.ReactNode; // Allow for custom icons
  children?: SidebarItem[]; // For nested menus
}

interface SidebarProps {
  items: SidebarItem[];
  activePath: string;
  logo?: React.ReactNode;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onNavigate?: (path: string) => void;
}

interface NavItemProps {
  item: SidebarItem;
  activePath: string;
  isRtl: boolean;
  collapsed: boolean;
  onNavigate?: (path: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, activePath, isRtl, collapsed, onNavigate }) => {
  const isActive = activePath === item.path || (item.children && item.children.some(child => activePath === child.path));
  const [expanded, setExpanded] = React.useState(isActive);

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault(); // Prevent default link behavior if using onNavigate
    if (onNavigate) {
        onNavigate(path);
    } 
    // If not using onNavigate, rely on <Link> component
  };

  const hasChildren = item.children && item.children.length > 0;

  const linkContent = (
    <>
      {item.icon && <span className={`flex-shrink-0 ${collapsed ? 'mx-auto' : (isRtl ? 'ml-3' : 'mr-3')}`}>{item.icon}</span>}
      {!collapsed && <span className="flex-grow whitespace-nowrap">{item.label}</span>}
      {!collapsed && hasChildren && (
        <span className={`transform transition-transform duration-200 ${expanded ? 'rotate-90' : ''} ${isRtl ? 'mr-auto' : 'ml-auto'}`}>
            <ChevronDownIcon />
        </span>
      )}
    </>
  );

  const linkClasses = `
    flex items-center p-2 rounded-lg text-base font-normal 
    text-gray-900 hover:bg-gray-100 
    ${isActive ? 'bg-gray-100' : ''}
    ${collapsed ? 'justify-center' : ''}
  `;

  return (
    <li>
      {onNavigate ? (
           <a
               href={item.path} // Keep href for semantics/SEO
               onClick={(e) => {
                   if (hasChildren) {
                       setExpanded(!expanded);
                   } else {
                       handleNavigation(e, item.path);
                   }
               }}
               className={linkClasses}
           >
               {linkContent}
           </a>
       ) : (
           <Link
               to={item.path}
               onClick={(e) => {
                   if (hasChildren) {
                       e.preventDefault(); // Prevent navigation for parent items
                       setExpanded(!expanded);
                   }
               }}
               className={linkClasses}
               aria-current={isActive ? 'page' : undefined}
           >
               {linkContent}
           </Link>
       )}
      {!collapsed && hasChildren && expanded && (
        <ul className={`mt-1 ${isRtl ? 'pr-4 border-r' : 'pl-4 border-l'} border-gray-200 space-y-1`}>
          {item.children?.map((child) => (
            <NavItem key={child.path} item={child} activePath={activePath} isRtl={isRtl} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </ul>
      )}
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activePath,
  logo,
  userName,
  userRole,
  userAvatar,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  onNavigate
}) => {
  const isRtl = useRtlDirection();

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${collapsed ? 'h-16' : 'h-16'}`}>
         {!collapsed && logo}
         <button
           onClick={onToggleCollapse}
           className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hidden lg:block"
           aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
         >
           {isRtl ? (collapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />) : (collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />)}
         </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto bg-white">
        <ul className="space-y-2">
          {items.map((item) => (
            <NavItem key={item.path} item={item} activePath={activePath} isRtl={isRtl} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </ul>
      </nav>

      {/* Footer (Optional User Info) */}
      {!collapsed && userName && (
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center">
            {/* User Avatar/Icon */}
            <div className="flex-shrink-0">
              {userAvatar ? (
                  <img className="h-8 w-8 rounded-full" src={userAvatar} alt="User" />
              ) : (
                  <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-gray-100">
                      <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                  </span>
              )}
            </div>
            <div className={`${isRtl ? 'mr-3' : 'ml-3'}`}>
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          fixed top-0 ${isRtl ? 'right-0' : 'left-0'} z-30 h-full bg-white border-${isRtl ? 'l' : 'r'} border-gray-200
          transition-width duration-300 ease-in-out hidden lg:block
          ${collapsed ? 'w-20' : 'w-64'}
        `}
        aria-label="Sidebar"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900 bg-opacity-50 transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onMobileClose}
        aria-hidden="true"
      />
      <aside
        className={`
          fixed top-0 ${isRtl ? 'right-0' : 'left-0'} z-50 h-full bg-white border-${isRtl ? 'l' : 'r'} border-gray-200
          w-64 transform transition-transform duration-300 ease-in-out lg:hidden
          ${mobileOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}
        `}
        aria-label="Sidebar"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {sidebarContent}
         {/* Close button for mobile */}
         <button
             onClick={onMobileClose}
             className="absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-1 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 lg:hidden"
         >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
         </button>
      </aside>
    </>
  );
}; 