'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WalletErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function WalletError({ error, reset }: WalletErrorProps) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('wallet.errors.title') || 'خطأ في نظام المحافظ'}
            </h2>
            <p className="text-gray-600 text-sm">
              {t('wallet.errors.description') || 'حدث خطأ أثناء تحميل نظام المحافظ. يرجى المحاولة مرة أخرى.'}
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="text-left p-3 bg-gray-100 rounded text-sm text-gray-700">
              <strong>Error:</strong> {error.message}
              {error.digest && (
                <div className="mt-1">
                  <strong>Digest:</strong> {error.digest}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={reset}
              className="flex-1 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('wallet.actions.retry') || 'إعادة المحاولة'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/umrahoffices/dashboard')}
              className="flex-1 flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              {t('wallet.actions.back_to_dashboard') || 'العودة للوحة التحكم'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 