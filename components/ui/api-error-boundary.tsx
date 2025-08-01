'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './button';
import { AlertCircle, RefreshCw, Wifi } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  errorMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ApiErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('API Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[200px] p-8">
          <div className="text-center space-y-4 max-w-md">
            <div className="flex justify-center">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                خطأ في تحميل البيانات
              </h3>
              <p className="text-gray-600 text-sm">
                {this.props.errorMessage || 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.'}
              </p>
              {this.state.error && (
                <details className="text-xs text-gray-500 mt-2">
                  <summary className="cursor-pointer">تفاصيل الخطأ</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-left overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                إعادة المحاولة
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Wifi className="h-4 w-4" />
                إعادة تحميل الصفحة
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ApiErrorBoundary; 