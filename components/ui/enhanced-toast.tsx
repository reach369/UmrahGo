"use client";

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EnhancedToastProps {
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  description?: string;
  duration?: number;
  isVisible?: boolean;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  className?: string;
}

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader2
};

const toastStyles = {
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: 'text-green-600',
    title: 'text-green-900',
    description: 'text-green-700'
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-600',
    title: 'text-red-900',
    description: 'text-red-700'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-600',
    title: 'text-yellow-900',
    description: 'text-yellow-700'
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    description: 'text-blue-700'
  },
  loading: {
    container: 'bg-gray-50 border-gray-200 text-gray-800',
    icon: 'text-gray-600',
    title: 'text-gray-900',
    description: 'text-gray-700'
  }
};

const positionStyles = {
  'top-right': 'top-4 right-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
};

export function EnhancedToast({
  type = 'info',
  title,
  description,
  duration = 5000,
  isVisible = true,
  onClose,
  action,
  position = 'top-right',
  className
}: EnhancedToastProps) {
  const Icon = toastIcons[type];
  const styles = toastStyles[type];
  
  React.useEffect(() => {
    if (isVisible && duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed z-50 w-full max-w-sm p-4 rounded-lg border shadow-lg transition-all duration-300',
      'animate-in slide-in-from-top-2 fade-in-0',
      styles.container,
      positionStyles[position],
      className
    )}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon 
            className={cn(
              'h-5 w-5',
              styles.icon,
              type === 'loading' && 'animate-spin'
            )} 
          />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className={cn('text-sm font-semibold', styles.title)}>
            {title}
          </div>
          {description && (
            <div className={cn('text-sm mt-1', styles.description)}>
              {description}
            </div>
          )}
          
          {/* Action Button */}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'text-sm font-medium underline hover:no-underline mt-2 block',
                styles.title
              )}
            >
              {action.label}
            </button>
          )}
        </div>
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'flex-shrink-0 rounded-md p-1 hover:bg-white/20 transition-colors',
              styles.icon
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Progress Bar */}
      {duration > 0 && (
        <div className="mt-3 h-1 bg-white/30 rounded-full overflow-hidden">
          <div 
            className={cn('h-full bg-current transition-all ease-linear', styles.icon)}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      
    </div>
  );
}

// Hook for managing enhanced toast state
export function useEnhancedToast() {
  const [toasts, setToasts] = React.useState<Array<EnhancedToastProps & { id: string }>>([]);

  const addToast = React.useCallback((toast: Omit<EnhancedToastProps, 'isVisible' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      ...toast,
      id,
      isVisible: true,
      onClose: () => removeToast(id)
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts
  };
}

// Toast Container Component
export function ToastContainer({ toasts }: { toasts: Array<EnhancedToastProps & { id: string }> }) {
  return (
    <>
      {toasts.map((toast, index) => (
        <EnhancedToast
          key={toast.id}
          {...toast}
          position="top-right"
          className={`z-${50 + index}`}
          //style={{ top: `${16 + index * 80}px` } as React.CSSProperties}
        />
        ))}
      </>
  );
} 