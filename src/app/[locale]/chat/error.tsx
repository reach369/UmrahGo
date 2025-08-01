'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, MessageSquare, Home } from 'lucide-react';

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const t = useTranslations('chat');

  useEffect(() => {
    // Log the error to console for debugging
    console.error('Chat system error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-center">
      <div className="max-w-md p-6 rounded-lg bg-card shadow-md border border-border">
        <div className="rounded-full bg-destructive/10 p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-3">
          {t('error_title', { default: 'Chat System Error' })}
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {error?.message || t('error_generic', { default: 'An error occurred while loading the chat system. Please try again.' })}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button 
            onClick={reset} 
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            {t('retry', { default: 'Try Again' })}
          </Button>
          
          <Button 
            onClick={() => router.push('/chat')} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            {t('back_to_chat', { default: 'Back to Chat' })}
          </Button>
          
          <Button 
            onClick={() => router.push('/')} 
            variant="ghost"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            {t('back_to_home', { default: 'Home Page' })}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-8">
          {t('error_reference', { default: 'Error Reference' })}: {error.digest || 'N/A'}
        </p>
      </div>
    </div>
  );
} 