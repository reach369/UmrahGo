'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider as LegacyAuthProvider, useAuth as useLegacyAuth } from '@/contexts/AuthContext';

// إنشاء سياق للمصادقة الموحدة
interface UnifiedAuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  userType: string | null;
  logout: () => Promise<void>;
  redirectToLogin: (callbackUrl?: string) => void;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

// مكون مزود المصادقة الموحد
export function UnifiedAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LegacyAuthProvider>
        <UnifiedAuthProviderInner>
          {children}
        </UnifiedAuthProviderInner>
      </LegacyAuthProvider>
    </SessionProvider>
  );
}

// المكون الداخلي الذي يجمع بين النظامين
function UnifiedAuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status: nextAuthStatus } = useSession();
  const { state: legacyState, logout: legacyLogout } = useLegacyAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // الحالة الموحدة
  const [unifiedState, setUnifiedState] = useState<{
    user: any;
    isLoading: boolean;
    isAuthenticated: boolean;
    userType: string | null;
  }>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    userType: null
  });

  // تحديث الحالة الموحدة عند تغير أي من النظامين
  useEffect(() => {
    const isNextAuthLoading = nextAuthStatus === 'loading';
    const isLegacyLoading = legacyState.isLoading;
    
    // تحديد المستخدم من أي من النظامين
    const nextAuthUser = session?.user;
    const legacyUser = legacyState.user;
    
    // استخدام المستخدم من النظام الذي يوفر بيانات
    const user = nextAuthUser || legacyUser;
    
    // تحديد نوع المستخدم
    let userType: string | null = null;
    
    // التحقق من NextAuth user
    if (nextAuthUser?.userType) {
      userType = nextAuthUser.userType;
    } 
    // التحقق من Legacy user roles
    else if (legacyUser && 'roles' in legacyUser && legacyUser.roles) {
      try {
        // محاولة الوصول إلى الاسم إذا كان كائنًا
        const roles = legacyUser.roles as any;
        if (Array.isArray(roles) && roles.length > 0) {
          const firstRole = roles[0];
          if (typeof firstRole === 'string') {
            userType = firstRole;
          } else if (typeof firstRole === 'object' && firstRole && 'name' in firstRole) {
            userType = String(firstRole.name);
          }
        }
      } catch (error) {
        console.error('Error accessing legacy user roles:', error);
      }
    } 
    // التحقق من NextAuth roles
    else if (nextAuthUser?.roles && Array.isArray(nextAuthUser.roles) && nextAuthUser.roles.length > 0) {
      try {
        const roles = nextAuthUser.roles as any[];
        const role = roles.find(r => r && typeof r === 'object' && 'name' in r);
        if (role && 'name' in role) {
          userType = String(role.name);
        }
      } catch (error) {
        console.error('Error accessing nextAuth user roles:', error);
      }
    }
    
    setUnifiedState({
      user,
      isLoading: isNextAuthLoading || isLegacyLoading,
      isAuthenticated: !!user,
      userType
    });
  }, [session, nextAuthStatus, legacyState]);

  // تسجيل الخروج من كلا النظامين
  const logout = async () => {
    try {
      // تسجيل الخروج من النظام القديم
      await legacyLogout();
      
      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      const locale = pathname?.split('/')[1] || 'ar';
      router.push(`/${locale}/auth/login`);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // التوجيه إلى صفحة تسجيل الدخول
  const redirectToLogin = (callbackUrl?: string) => {
    const locale = pathname?.split('/')[1] || 'ar';
    const loginPath = `/${locale}/auth/login`;
    
    if (callbackUrl) {
      router.push(`${loginPath}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else {
      router.push(loginPath);
    }
  };

  const value: UnifiedAuthContextType = {
    ...unifiedState,
    logout,
    redirectToLogin
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

// هوك للوصول إلى سياق المصادقة الموحد
export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
} 