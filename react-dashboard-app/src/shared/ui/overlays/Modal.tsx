import React, { useEffect, useRef } from 'react';
import { useRtlDirection } from '../../utils/rtl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode; // Optional footer for buttons
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    footer, 
    size = 'md' 
}) => {
  const isRtl = useRtlDirection();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle closing modal with Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle closing modal by clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl transform transition-all w-full ${sizeClasses[size]} overflow-hidden`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
            {title}
          </h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            {/* Close Icon */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`px-4 py-3 bg-gray-50 ${isRtl ? 'text-left' : 'text-right'} sm:px-6 border-t border-gray-200`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}; 