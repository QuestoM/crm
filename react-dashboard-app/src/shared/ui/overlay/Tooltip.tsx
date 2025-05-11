import React, { ReactNode, useState, useRef, useEffect } from 'react';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

/**
 * Tooltip component for displaying additional information on hover
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = '',
  contentClassName = '',
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const childRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Position based classes
  const getPositionClasses = (): string => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-1';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-1';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-1';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-1';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-1';
    }
  };

  // Arrow position classes
  const getArrowClasses = (): string => {
    switch (position) {
      case 'top':
        return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent';
      case 'right':
        return 'left-0 top-1/2 transform -translate-y-1/2 -translate-x-full border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent';
      case 'bottom':
        return 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'right-0 top-1/2 transform -translate-y-1/2 translate-x-full border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent';
      default:
        return 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent';
    }
  };

  // Position tooltip
  const updatePosition = () => {
    if (!childRef.current) return;
    
    const rect = childRef.current.getBoundingClientRect();
    setCoords({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
    });
  };

  // Show tooltip after delay
  const handleMouseEnter = () => {
    if (disabled) return;
    updatePosition();
    
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  // Hide tooltip
  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsVisible(false);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`inline-block relative ${className}`}
      ref={childRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 whitespace-nowrap
            max-w-xs px-3 py-2 
            bg-gray-800 text-white text-sm
            rounded shadow-lg
            ${getPositionClasses()}
            ${contentClassName}
          `}
          role="tooltip"
        >
          {content}
          <div 
            className={`
              absolute w-0 h-0
              border-4
              ${getArrowClasses()}
            `}
          />
        </div>
      )}
    </div>
  );
}; 