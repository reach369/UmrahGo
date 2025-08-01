'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WalletNotFound() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <FileQuestion className="h-6 w-6 text-gray-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('wallet.errors.not_found') || 'الصفحة غير موجودة'}
            </h2>
            <p className="text-gray-600 text-sm">
              {t('wallet.errors.page_not_found_description') || 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('wallet.actions.go_back') || 'العودة'}
            </Button>
            
            <Link href="/umrahoffices/dashboard/wallet" className="flex-1">
              <Button className="w-full flex items-center gap-2">
                <Home className="h-4 w-4" />
                {t('wallet.actions.wallet_home') || 'الصفحة الرئيسية للمحافظ'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 