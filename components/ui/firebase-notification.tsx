"use client";

import React, { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { CheckCircle2, XCircle, Loader2, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FirebaseNotificationProps {
  type: 'success' | 'error' | 'loading' | 'info' | 'warning';
  title: string;
  message: string;
  onClose?: () => void;
  onRetry?: () => void;
  autoClose?: boolean;
  duration?: number;
  showProgress?: boolean;
  className?: string;
}

export const FirebaseNotification: React.FC<FirebaseNotificationProps> = ({
  type,
  title,
  message,
  onClose,
  onRetry,
  autoClose = false,
  duration = 5000,
  showProgress = false,
  className = ''
}) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // Allow fade animation
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'loading':
        return 'text-blue-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`
      fixed top-4 right-4 left-4 md:right-4 md:left-auto md:w-96 z-50
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
      ${className}
    `}>
      <Alert className={`
        ${getBackgroundColor()} 
        ${getTextColor()} 
        shadow-lg border-l-4 backdrop-blur-sm
      `}>
        <div className="flex items-start space-x-3 space-x-reverse">
          {/* Google Icon for Google-related notifications */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <FcGoogle className="h-5 w-5" />
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{title}</h4>
            <AlertDescription className="text-sm mt-1">
              {message}
            </AlertDescription>
            
            {/* Progress bar for auto-closing notifications */}
            {showProgress && autoClose && (
              <div className="mt-3">
                <Progress 
                  value={progress} 
                  className="h-1"
                />
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex items-center space-x-2 space-x-reverse mt-3">
              {onRetry && type === 'error' && (
                <Button
                  onClick={onRetry}
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs"
                >
                  إعادة المحاولة
                </Button>
              )}
              
              <Button
                onClick={handleClose}
                size="sm"
                variant="ghost"
                className="h-7 px-3 text-xs"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
};

// Google-specific notification components
export const GoogleSignInNotification = {
  Loading: ({ onClose }: { onClose?: () => void }) => (
    <FirebaseNotification
      type="loading"
      title="تسجيل الدخول باستخدام Google"
      message="جاري التحقق من بيانات اعتمادك مع Google..."
      onClose={onClose}
      showProgress={false}
    />
  ),

  Success: ({ onClose }: { onClose?: () => void }) => (
    <FirebaseNotification
      type="success"
      title="تم تسجيل الدخول بنجاح!"
      message="مرحباً بك، جاري تحويلك إلى لوحة التحكم..."
      onClose={onClose}
      autoClose={true}
      duration={3000}
      showProgress={true}
    />
  ),

  Error: ({ 
    errorMessage, 
    onClose, 
    onRetry 
  }: { 
    errorMessage: string; 
    onClose?: () => void; 
    onRetry?: () => void;
  }) => (
    <FirebaseNotification
      type="error"
      title="خطأ في تسجيل الدخول"
      message={errorMessage}
      onClose={onClose}
      onRetry={onRetry}
      autoClose={false}
    />
  ),

  PopupBlocked: ({ onClose, onRetry }: { onClose?: () => void; onRetry?: () => void }) => (
    <FirebaseNotification
      type="warning"
      title="النافذة المنبثقة محظورة"
      message="يرجى السماح بالنوافذ المنبثقة لهذا الموقع وإعادة المحاولة"
      onClose={onClose}
      onRetry={onRetry}
      autoClose={false}
    />
  ),

  NetworkError: ({ onClose, onRetry }: { onClose?: () => void; onRetry?: () => void }) => (
    <FirebaseNotification
      type="error"
      title="خطأ في الشبكة"
      message="تعذر الاتصال بخوادم Google. يرجى التحقق من اتصال الإنترنت وإعادة المحاولة"
      onClose={onClose}
      onRetry={onRetry}
      autoClose={false}
    />
  ),

  AccountExists: ({ onClose }: { onClose?: () => void }) => (
    <FirebaseNotification
      type="info"
      title="الحساب موجود مسبقاً"
      message="هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام طريقة تسجيل الدخول الأصلية"
      onClose={onClose}
      autoClose={false}
    />
  )
};

// Hook for managing multiple notifications
export const useFirebaseNotifications = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    component: React.ReactNode;
  }>>([]);

  const addNotification = (component: React.ReactNode) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, component }]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const showGoogleSignInLoading = () => {
    return addNotification(
      <GoogleSignInNotification.Loading 
        onClose={() => clearAllNotifications()} 
      />
    );
  };

  const showGoogleSignInSuccess = () => {
    clearAllNotifications();
    return addNotification(
      <GoogleSignInNotification.Success 
        onClose={() => clearAllNotifications()} 
      />
    );
  };

  const showGoogleSignInError = (errorMessage: string, onRetry?: () => void) => {
    clearAllNotifications();
    return addNotification(
      <GoogleSignInNotification.Error 
        errorMessage={errorMessage}
        onClose={() => clearAllNotifications()}
        onRetry={onRetry}
      />
    );
  };

  const NotificationContainer = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {notifications.map(({ id, component }) => (
        <div key={id} className="pointer-events-auto">
          {component}
        </div>
      ))}
    </div>
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showGoogleSignInLoading,
    showGoogleSignInSuccess,
    showGoogleSignInError,
    NotificationContainer
  };
};

export default FirebaseNotification; 