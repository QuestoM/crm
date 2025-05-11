// RTL utilities for the CRM system
import { useEffect, useState } from 'react';

// Helper to determine if we should use RTL direction
export const useRtlDirection = (): boolean => {
  // For now, we're hardcoding Hebrew as RTL language
  // In a real app, this might check locale, user settings, or context
  return true; // Always return true for now to ensure RTL
};

// Helper to swap CSS properties for RTL support
export const swapRtlProperties = (
  value: any,
  ltrProperty: string,
  rtlProperty: string,
  isRtl: boolean
) => ({
  [isRtl ? rtlProperty : ltrProperty]: value,
});

// RTL aware margin helper
export const rtlMargin = (
  position: 'start' | 'end',
  value: string | number,
  isRtl: boolean
) => {
  const prop = position === 'start' 
    ? (isRtl ? 'marginRight' : 'marginLeft')
    : (isRtl ? 'marginLeft' : 'marginRight');
  
  return { [prop]: value };
};

// Apply RTL-aware text alignment
export const rtlTextAlign = (isRtl: boolean) => {
  return { textAlign: isRtl ? 'right' : 'left' };
};

// Convert normal flex direction to RTL-aware flex direction
export const rtlFlexDirection = (direction: 'row' | 'column', isRtl: boolean) => {
  if (direction === 'column') return { flexDirection: direction };
  return { flexDirection: isRtl ? 'row-reverse' : 'row' };
};

// Add other RTL helper functions here if needed later
// e.g., for swapping margin/padding, adjusting flex direction, etc. 