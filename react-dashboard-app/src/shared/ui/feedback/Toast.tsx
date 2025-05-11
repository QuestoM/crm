import React, { useState, useEffect, ReactNode } from 'react';

type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ToastProps {
  title?: string;
  children: ReactNode;
  type?: ToastType;
  duration?: number; // Duration in milliseconds
  position?: ToastPosition;
  onClose?: () => void;
  visible?: boolean;
}

/**
 * Toast notification component for temporary feedback
 */
export const Toast: React.FC<ToastProps> = ({
  title,
  children,
  type = 'info',
  duration = 5000, // Default 5 seconds
  position = 'bottom-right',
  onClose,
  visible = true,
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  // Type-specific styles
  const typeStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200',
      title: 'text-blue-800',
      message: 'text-blue-700',
      icon: 'text-blue-400',
    },
    success: {
      container: 'bg-green-50 border-green-200',
      title: 'text-green-800',
      message: 'text-green-700',
      icon: 'text-green-400',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      icon: 'text-yellow-400',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      title: 'text-red-800',
      message: 'text-red-700',
      icon: 'text-red-400',
    },
  };

  // Position styles
  const positionStyles = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  // Icon based on toast type
  const icons = {
    info: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    success: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  useEffect(() => {
    if (duration && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          onClose();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, isVisible, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed ${positionStyles[position]} z-50 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto transition-opacity duration-300 opacity-100`}
    >
      <div
        className={`rounded-lg border shadow-xs overflow-hidden ${typeStyles[type].container}`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 ${typeStyles[type].icon}`}>
              {icons[type]}
            </div>
            <div className="mr-3 ml-3 w-0 flex-1 pt-0.5">
              {title && <p className={`text-sm font-medium ${typeStyles[type].title}`}>{title}</p>}
              <p className={`mt-1 text-sm ${typeStyles[type].message}`}>{children}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`inline-flex text-gray-400 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150`}
                onClick={() => {
                  setIsVisible(false);
                  if (onClose) {
                    onClose();
                  }
                }}
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 