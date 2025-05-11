import React, { ReactNode } from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface RtlLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * RtlLayout component that handles RTL direction based on the current language
 * Automatically applies the correct text direction
 */
export const RtlLayout: React.FC<RtlLayoutProps> = ({ 
  children, 
  className = ''
}) => {
  const isRtl = useRtlDirection();
  
  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className={`${className} ${isRtl ? 'font-hebrew' : 'font-base'}`}
      style={{ 
        textAlign: isRtl ? 'right' : 'left',
      }}
    >
      {children}
    </div>
  );
}; 