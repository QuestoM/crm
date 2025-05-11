import React, { ReactNode, useEffect, useState } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  overlayClassName?: string;
}

/**
 * Modal component for dialogs, popups, and alerts
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  overlayClassName = '',
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  // Update visibility when isOpen prop changes
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (isVisible && closeOnEsc && event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isVisible, closeOnEsc, onClose]);

  // Handle body scroll lock
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // Size classes for modal width
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay/backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${overlayClassName}`}
        onClick={closeOnClickOutside ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal content positioning */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Actual modal */}
        <div
          className={`transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all ${sizeClasses[size]} ${className}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Modal header */}
          {(title || showCloseButton) && (
            <div className={`px-6 py-4 border-b border-gray-200 ${headerClassName}`}>
              <div className="flex items-center justify-between">
                {title && (
                  <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    type="button"
                    className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Modal body */}
          <div className={`px-6 py-4 ${bodyClassName}`}>{children}</div>

          {/* Modal footer */}
          {footer && (
            <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${footerClassName}`}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 