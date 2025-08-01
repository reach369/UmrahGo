'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Chat error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-card">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          
          <h2 className="text-2xl font-bold">حدث خطأ في نظام المحادثات</h2>
          <p className="text-muted-foreground">
            نعتذر عن هذا الخطأ. يمكنك إعادة المحاولة أو العودة إلى الصفحة الرئيسية.
          </p>
          
          <div className="text-left w-full bg-muted/50 rounded p-3 my-2 overflow-auto max-h-32 text-xs">
            <code>{error.message}</code>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Button 
              variant="default" 
              className="flex-1"
              onClick={() => reset()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              إعادة المحاولة
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push('/')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 