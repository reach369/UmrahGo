"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error, 
      errorInfo: null,
      isRetrying: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to error tracking service (like Sentry) if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }
  }

  getErrorType = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes('firebase') || message.includes('auth/')) {
      return 'firebase';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('chunk') || message.includes('loading')) {
      return 'loading';
    }
    return 'general';
  };

  getErrorMessage = (error: Error): { title: string; description: string; action: string } => {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'firebase':
        return {
          title: 'خطأ في المصادقة',
          description: 'حدث خطأ أثناء عملية تسجيل الدخول. يرجى المحاولة مرة أخرى أو استخدام طريقة تسجيل دخول مختلفة.',
          action: 'إعادة المحاولة'
        };
      case 'network':
        return {
          title: 'خطأ في الشبكة',
          description: 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
          action: 'إعادة المحاولة'
        };
      case 'loading':
        return {
          title: 'خطأ في التحميل',
          description: 'فشل في تحميل جزء من التطبيق. يرجى إعادة تحميل الصفحة.',
          action: 'إعادة التحميل'
        };
      default:
        return {
          title: 'حدث خطأ غير متوقع',
          description: 'نعتذر، حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة أو التواصل مع الدعم إذا استمر الخطأ.',
          action: 'إعادة التحميل'
        };
    }
  };

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    try {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset error state
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        isRetrying: false
      });
    } catch (error) {
      console.error('Retry failed:', error);
      this.setState({ isRetrying: false });
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;
      const errorDetails = error ? this.getErrorMessage(error) : null;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                {errorDetails?.title || 'حدث خطأ'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {errorDetails?.description || 'نعتذر، حدث خطأ غير متوقع'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Details for Development */}
              {this.props.showDetails && error && process.env.NODE_ENV === 'development' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <details>
                      <summary className="cursor-pointer font-medium">تفاصيل الخطأ (للمطورين)</summary>
                      <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto">
                        {error.stack}
                      </pre>
                    </details>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className="w-full"
                  variant="default"
                >
                  {this.state.isRetrying ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      جاري إعادة المحاولة...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {errorDetails?.action || 'إعادة المحاولة'}
                    </>
                  )}
                </Button>

                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  إعادة تحميل الصفحة
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  العودة للرئيسية
                </Button>
              </div>

              {/* Support Information */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t">
                <p>إذا استمر الخطأ، يرجى التواصل مع الدعم</p>
                <p className="text-xs mt-1">
                  رقم الخطأ: {error?.name || 'Unknown'} - {Date.now()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('Error Handler:', error, errorInfo);
    
    // You can add custom error reporting here
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: errorInfo
      });
    }
  };

  return { handleError };
};

// Higher Order Component
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary; 