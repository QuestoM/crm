import React, { ReactNode } from 'react';

export interface ButtonGroupProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
  attached?: boolean;
}

/**
 * ButtonGroup component for grouped button controls
 */
export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  size,
  className = '',
  fullWidth = false,
  attached = true,
}) => {
  // Orientation classes
  const orientationClass = orientation === 'vertical' 
    ? 'flex-col' 
    : 'flex-row';
  
  // Width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Attached styling - buttons share borders
  const attachedClass = attached ? (
    orientation === 'vertical' 
      ? '[&>*:not(:first-child)]:border-t-0 [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none' 
      : '[&>*:not(:first-child)]:border-l-0 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none'
  ) : '';
  
  // Base classes
  const groupClasses = `
    flex ${orientationClass} ${widthClass} ${attachedClass} ${className}
  `;

  // Clone children to pass down size prop if provided
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && size) {
      return React.cloneElement(child, { 
        size,
        // If attached, buttons should have consistent width
        ...(fullWidth && orientation === 'horizontal' ? { className: 'flex-1' } : {})
      });
    }
    return child;
  });

  return (
    <div className={groupClasses} role="group">
      {childrenWithProps}
    </div>
  );
};
