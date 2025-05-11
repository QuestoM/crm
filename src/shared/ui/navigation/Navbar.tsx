import React, { useState, useRef, useEffect } from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface NavbarProps {
  title?: string;
  logo?: React.ReactNode;
  onToggleSidebar?: () => void;
  actions?: React.ReactNode;
  notifications?: {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }[];
  onNotificationClick?: (id: string) => void;
  onAllNotificationsClick?: () => void;
  userName?: string;
  userAvatar?: string;
  userMenuItems?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  }[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

/**
 * Responsive top navbar with RTL support
 * Includes mobile menu toggle, notifications dropdown, user menu, and search
 */
export const Navbar: React.FC<NavbarProps> = ({
  title,
  logo,
  onToggleSidebar,
  actions,
  notifications = [],
  onNotificationClick,
  onAllNotificationsClick,
  userName,
  userAvatar,
  userMenuItems = [],
  searchPlaceholder = 'חיפוש...',
  onSearch,
}) => {
  const isRtl = useRtlDirection();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current && 
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      
      if (
        userMenuRef.current && 
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };
  
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  
  return (
    <header 
      className="bg-white border-b border-gray-200 fixed left-0 right-0 top-0 z-30 h-16"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          {onToggleSidebar && (
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
              onClick={onToggleSidebar}
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          )}
          
          {logo && (
            <div className={`${onToggleSidebar ? 'ml-4' : ''} lg:hidden`}>
              {logo}
            </div>
          )}
          
          {title && (
            <h1 className={`text-xl font-semibold text-gray-800 ${isRtl ? 'mr-4' : 'ml-4'} hidden lg:block`}>
              {title}
            </h1>
          )}
        </div>
        
        <div className="flex-1 max-w-md mx-auto px-4 hidden md:block">
          {onSearch && (
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                className={`
                  w-full py-2 pl-10 pr-4 
                  text-gray-700 bg-gray-100 
                  border border-transparent rounded-md 
                  focus:outline-none focus:bg-white focus:border-gray-300
                  ${isRtl ? 'text-right pr-10 pl-4' : ''}
                `}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className={`absolute inset-y-0 ${isRtl ? 'right-0 mr-3' : 'left-0 ml-3'} flex items-center`}
                aria-label="Search"
              >
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path 
                    fillRule="evenodd" 
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
        
        <div className="flex items-center">
          {actions}
          
          {/* Notifications dropdown */}
          {notifications.length > 0 && (
            <div className="relative mr-4" ref={notificationsRef}>
              <button
                type="button"
                className="relative p-1 text-gray-500 rounded-full hover:text-gray-700 focus:outline-none"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label={`${unreadNotificationsCount} unread notifications`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                  />
                </svg>
                
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>
              
              {notificationsOpen && (
                <div 
                  className={`
                    origin-top-${isRtl ? 'left' : 'right'} 
                    absolute 
                    ${isRtl ? 'left-0' : 'right-0'} 
                    mt-2 
                    w-80 
                    rounded-md 
                    shadow-lg 
                    py-1 
                    bg-white 
                    ring-1 
                    ring-black 
                    ring-opacity-5 
                    focus:outline-none 
                    z-50
                  `}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-800">התראות</h2>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        אין התראות חדשות
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          className={`
                            w-full px-4 py-3 text-left border-b border-gray-100 hover:bg-gray-50
                            ${notification.read ? 'opacity-75' : 'bg-blue-50'}
                            ${isRtl ? 'text-right' : 'text-left'}
                          `}
                          onClick={() => {
                            if (onNotificationClick) {
                              onNotificationClick(notification.id);
                            }
                            setNotificationsOpen(false);
                          }}
                        >
                          <div className="text-sm font-semibold text-gray-800">{notification.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{notification.message}</div>
                          <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                        </button>
                      ))
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          if (onAllNotificationsClick) {
                            onAllNotificationsClick();
                          }
                          setNotificationsOpen(false);
                        }}
                      >
                        צפה בכל ההתראות
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* User menu */}
          {userName && (
            <div className="relative ml-3" ref={userMenuRef}>
              <button
                type="button"
                className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                {userAvatar ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={userAvatar}
                    alt={userName}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`${isRtl ? 'mr-2' : 'ml-2'} hidden md:block text-sm text-gray-700`}>
                  {userName}
                </span>
                <svg 
                  className={`${isRtl ? 'mr-1' : 'ml-1'} hidden md:block h-4 w-4 text-gray-500`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
              
              {userMenuOpen && (
                <div 
                  className={`
                    origin-top-${isRtl ? 'left' : 'right'} 
                    absolute 
                    ${isRtl ? 'left-0' : 'right-0'} 
                    mt-2 
                    w-48 
                    rounded-md 
                    shadow-lg 
                    py-1 
                    bg-white 
                    ring-1 
                    ring-black 
                    ring-opacity-5 
                    focus:outline-none 
                    z-50
                  `}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                  </div>
                  
                  {userMenuItems.map((item, index) => (
                    <button
                      key={index}
                      className={`
                        flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100
                        ${isRtl ? 'text-right' : 'text-left'}
                      `}
                      onClick={() => {
                        item.onClick();
                        setUserMenuOpen(false);
                      }}
                    >
                      {item.icon && (
                        <span className={`${isRtl ? 'ml-3' : 'mr-3'} text-gray-500`}>
                          {item.icon}
                        </span>
                      )}
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}; 