import React, { ReactNode, FormHTMLAttributes } from 'react';

export type FormLayout = 'vertical' | 'horizontal' | 'inline';

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  layout?: FormLayout;
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Form component for organizing form inputs
 */
export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  layout = 'vertical',
  spacing = 'md',
  className = '',
  ...props
}) => {
  // Prevent default form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  // Layout classes
  const layoutClasses = {
    vertical: 'flex flex-col',
    horizontal: 'sm:grid sm:grid-cols-12 sm:gap-x-4',
    inline: 'flex flex-row flex-wrap items-end',
  };

  // Spacing classes
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  };
  
  // Only apply spacing to vertical layout
  const spacingClass = layout === 'vertical' ? spacingClasses[spacing] : '';

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${layoutClasses[layout]} ${spacingClass} ${className}`}
      {...props}
    >
      {children}
    </form>
  );
};

interface FormItemProps {
  children: ReactNode;
  label?: string;
  labelFor?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  labelClassName?: string;
  labelCol?: number;
  wrapperCol?: number;
  layout?: FormLayout;
}

/**
 * FormItem component for wrapping form inputs with labels and error messages
 */
export const FormItem: React.FC<FormItemProps> = ({
  children,
  label,
  labelFor,
  required = false,
  error,
  helperText,
  className = '',
  labelClassName = '',
  labelCol = 3,
  wrapperCol = 9,
  layout = 'vertical',
}) => {
  // Base classes
  let containerClasses = className;
  let labelClasses = `block text-sm font-medium text-gray-700 ${labelClassName}`;
  let contentClasses = '';

  // Apply different classes based on layout
  if (layout === 'horizontal') {
    labelClasses = `${labelClasses} sm:col-span-${labelCol} sm:mt-px sm:pt-2`;
    contentClasses = `sm:col-span-${wrapperCol}`;
    containerClasses = `${containerClasses} sm:grid sm:grid-cols-12 sm:gap-x-4 sm:items-start`;
  } else if (layout === 'inline') {
    containerClasses = `${containerClasses} mx-2`;
  } else {
    containerClasses = `${containerClasses} mb-4`;
  }

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={labelFor} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={contentClasses}>
        {children}
        
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        ) : null}
      </div>
    </div>
  );
};

interface FormActionProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * FormAction component for form submit buttons and actions
 */
export const FormAction: React.FC<FormActionProps> = ({
  children,
  className = '',
  align = 'left',
}) => {
  // Alignment classes
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`mt-6 flex ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
}; 