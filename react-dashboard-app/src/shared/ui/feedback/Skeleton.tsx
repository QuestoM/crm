import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  className?: string;
  count?: number;
  gap?: number | string;
}

/**
 * Skeleton component for loading states
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
  gap = '0.5rem',
}) => {
  // Base styles for animation
  const baseStyle = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  // Variant specific styles
  const variantStyle = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'rectangular':
        return 'rounded-md';
      case 'circular':
        return 'rounded-full';
      default:
        return 'rounded';
    }
  };
  
  // Combine styles
  const skeletonStyle = `${baseStyle} ${variantStyle()} ${className}`;
  
  // Style object for width and height
  const styleObj: React.CSSProperties = {
    width: width ?? '100%',
    height: height ?? (variant === 'text' ? '1rem' : '5rem'),
    marginBottom: typeof gap === 'number' ? `${gap}px` : gap,
  };

  // Create multiple skeletons if count > 1
  if (count > 1) {
    return (
      <div className="flex flex-col">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={skeletonStyle}
            style={{ 
              ...styleObj,
              marginBottom: index < count - 1 ? styleObj.marginBottom : 0,
            }}
          />
        ))}
      </div>
    );
  }

  // Single skeleton
  return <div className={skeletonStyle} style={styleObj} />;
}; 