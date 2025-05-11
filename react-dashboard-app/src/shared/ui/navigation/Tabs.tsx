import React, { useState, useEffect, ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string | ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultActiveTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'boxed';
  fullWidth?: boolean;
  className?: string;
  tabsClassName?: string;
  contentClassName?: string;
}

/**
 * Tabs component for content organization
 */
export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultActiveTab,
  activeTab,
  onChange,
  variant = 'underline',
  fullWidth = false,
  className = '',
  tabsClassName = '',
  contentClassName = '',
}) => {
  // Initialize active tab state
  const [selectedTab, setSelectedTab] = useState<string>(
    activeTab || defaultActiveTab || (items.length > 0 ? items[0].id : '')
  );

  // Update selected tab if activeTab prop changes
  useEffect(() => {
    if (activeTab && activeTab !== selectedTab) {
      setSelectedTab(activeTab);
    }
  }, [activeTab]);

  // Handle tab click
  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    
    const newTab = tabId;
    setSelectedTab(newTab);
    
    if (onChange) {
      onChange(newTab);
    }
  };

  // Get tab style based on variant
  const getTabStyle = (isActive: boolean, disabled?: boolean): string => {
    const baseStyles = 'px-4 py-2 text-sm font-medium transition-colors duration-200';
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    if (variant === 'underline') {
      return `
        ${baseStyles} ${disabledStyles}
        ${isActive 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300 border-b-2 border-transparent'}
      `;
    } else if (variant === 'pills') {
      return `
        ${baseStyles} ${disabledStyles} rounded-full
        ${isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-600 hover:bg-gray-100'}
      `;
    } else if (variant === 'boxed') {
      return `
        ${baseStyles} ${disabledStyles} 
        ${isActive 
          ? 'bg-white border-t border-r border-l rounded-t-lg text-blue-600' 
          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}
      `;
    }
    
    return baseStyles;
  };

  // Get active tab content
  const activeTabContent = items.find(tab => tab.id === selectedTab)?.content;

  return (
    <div className={`w-full ${className}`}>
      <div className={`flex ${fullWidth ? 'w-full' : ''} ${variant === 'boxed' ? 'border-b' : ''} ${tabsClassName}`}>
        {items.map(tab => (
          <div 
            key={tab.id}
            className={`
              ${getTabStyle(selectedTab === tab.id, tab.disabled)}
              ${fullWidth ? 'flex-1 text-center' : ''}
            `}
            onClick={() => handleTabClick(tab.id, tab.disabled)}
            role="tab"
            aria-selected={selectedTab === tab.id}
            tabIndex={tab.disabled ? -1 : 0}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div className={`py-4 ${contentClassName}`}>
        {activeTabContent}
      </div>
    </div>
  );
}; 