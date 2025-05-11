import React from 'react';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Form field component with label and error handling
 */
const Field: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  required = false,
  children,
  className = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={htmlFor} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

/**
 * Form component with integrated validation support
 */
export const Form: React.FC<FormProps> & { Field: typeof Field } = ({
  children,
  ...props
}) => {
  return (
    <form {...props}>
      {children}
    </form>
  );
};

// Add Field as a static property of Form
Form.Field = Field; 