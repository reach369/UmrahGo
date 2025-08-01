'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ChatErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ChatErrorBoundary component
 * Custom error boundary for chat components to gracefully handle errors
 */
export class ChatErrorBoundary extends React.Component<ChatErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Chat error caught by error boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      return this.props.fallback || <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

/**
 * ErrorFallback component
 * Default fallback UI when an error occurs in the chat system
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const t = useTranslations('chat');
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-background rounded-md border border-border">
      <div className="rounded-full bg-destructive/10 p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-3">
        {t('error_title', { default: 'Chat System Error' })}
      </h3>
      
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        {error?.message || t('error_generic', { default: 'An error occurred in the chat system. Please try again.' })}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onReset} 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t('retry', { default: 'Try Again' })}
        </Button>
        
        <Button 
          onClick={() => router.push('/')} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          {t('back_to_home', { default: 'Back to Home' })}
        </Button>
      </div>
      
      {error && (
        <p className="text-xs text-muted-foreground mt-8">
          {error.name}: {error.message}
        </p>
      )}
    </div>
  );
}; 