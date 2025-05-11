import React, { ReactNode } from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface RtlLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Simple wrapper component to apply RTL direction and base font if needed.
 */
export const RtlLayout: React.FC<RtlLayoutProps> = ({ children, className = '' }) => {
  const isRtl = useRtlDirection();

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={`${className} ${isRtl ? 'font-hebrew' : ''}`}>
      {children}
    </div>
  );
}; 