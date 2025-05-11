// src/shared/utils/rtl.ts
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

// Helper to determine if we should use RTL direction
export const useRtlDirection = () => {
  const { language } = useContext(SettingsContext);
  return language === 'he';
};

// Helper to swap CSS properties for RTL support
export const swapRtlProperties = (
  ltrProperty: string, 
  rtlProperty: string, 
  value: string,
  isRtl: boolean
) => {
  return {
    [isRtl ? rtlProperty : ltrProperty]: value,
  };
};

// RTL aware margin helper
export const rtlMargin = (
  size: number, 
  position: 'start' | 'end',
  isRtl: boolean
) => {
  const prop = position === 'start' 
    ? (isRtl ? 'marginRight' : 'marginLeft')
    : (isRtl ? 'marginLeft' : 'marginRight');
  
  return { [prop]: `${size}px` };
};

// Apply RTL-aware text alignment
export const rtlTextAlign = (isRtl: boolean) => {
  return { textAlign: isRtl ? 'right' : 'left' };
};

// Convert normal flex direction to RTL-aware flex direction
export const rtlFlexDirection = (direction: 'row' | 'column', isRtl: boolean) => {
  if (direction === 'column') return { flexDirection: 'column' };
  return { flexDirection: isRtl ? 'row-reverse' : 'row' };
};

// Example RTL-aware layout component usage:
// <div style={{
//   ...rtlTextAlign(isRtl),
//   ...rtlFlexDirection('row', isRtl),
//   ...rtlMargin(16, 'start', isRtl),
// }}>
//   Content here
// </div>
