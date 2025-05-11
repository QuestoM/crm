import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Toast } from './Toast';

type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ToastItem {
  id: string;
  title?: string;
  message: ReactNode;
  type: ToastType;
  duration?: number;
}

interface ToastContextProps {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'bottom-right',
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: ToastItem[];
  position: ToastPosition;
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, position, onRemove }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          type={toast.type}
          duration={toast.duration}
          position={position}
          onClose={() => onRemove(toast.id)}
        >
          {toast.message}
        </Toast>
      ))}
    </>
  );
};

// Helper functions for common toast types
export const toast = {
  info: (message: ReactNode, options?: { title?: string; duration?: number }) => {
    const context = useToast();
    context.addToast({ message, type: 'info', ...options });
  },
  success: (message: ReactNode, options?: { title?: string; duration?: number }) => {
    const context = useToast();
    context.addToast({ message, type: 'success', ...options });
  },
  warning: (message: ReactNode, options?: { title?: string; duration?: number }) => {
    const context = useToast();
    context.addToast({ message, type: 'warning', ...options });
  },
  error: (message: ReactNode, options?: { title?: string; duration?: number }) => {
    const context = useToast();
    context.addToast({ message, type: 'error', ...options });
  },
}; 