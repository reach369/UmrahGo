'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { Loader2 } from 'lucide-react';

interface ProtectedAuthRouteProps {
  children: React.ReactNode;
  locale: string;
}

/**
 * هذا المكون يمنع المستخدمين المسجلين من الوصول إلى صفحات المصادقة
 * إذا كان المستخدم مسجلاً بالفعل، سيتم توجيهه إلى لوحة التحكم الخاصة به
 */
export default function ProtectedAuthRoute({ children, locale }: ProtectedAuthRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, getUserRole } = useSessionPersistence();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    // التحقق مما إذا كان المستخدم مسجلاً
    if (isAuthenticated) {
      const userRole = getUserRole();
      
      // تحديد مسار التوجيه بناءً على الدور
      let redirectPath = '';
      
      switch(userRole) {
        case 'office':
          redirectPath = `/${locale}/umrahoffices/dashboard`;
          break;
        case 'bus_operator':
          redirectPath = `/${locale}/bus-operator`;
          break;
        case 'admin':
          redirectPath = `/${locale}/admin/dashboard`;
          break;
        default:
          redirectPath = `/${locale}/PilgrimUser`;
      }
      
      // توجيه المستخدم
      router.replace(redirectPath);
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, isHydrated, locale, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
} 