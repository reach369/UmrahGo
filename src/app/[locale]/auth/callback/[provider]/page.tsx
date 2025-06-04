"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

export default function SocialLoginCallback() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (error) {
      window.opener?.postMessage(
        { type: 'social-login-error', error },
        window.location.origin
      );
      window.close();
      return;
    }

    if (code) {
      window.opener?.postMessage(
        { type: 'social-login-success', accessToken: code },
        window.location.origin
      );
      window.close();
      return;
    }
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-lg">جاري إكمال عملية تسجيل الدخول...</p>
            <p className="text-sm text-gray-500 mt-2">يمكنك إغلاق هذه النافذة إذا لم تغلق تلقائياً</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 