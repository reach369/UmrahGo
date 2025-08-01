'use client';

import { useEffect, useState } from 'react';
import { useSessionPersistence } from './useSessionPersistence';
import { useUnifiedAuth } from '@/providers/AuthProvider';

/**
 * هوك موحد للمصادقة يجمع بين useSessionPersistence و useUnifiedAuth
 * لتوفير واجهة موحدة للمصادقة في جميع أنحاء التطبيق
 */
export function useAuth() {
  const sessionPersistence = useSessionPersistence();
  const unifiedAuth = useUnifiedAuth();
  
  // حالة موحدة للمصادقة
  const [authState, setAuthState] = useState({
    user: null as any,
    isAuthenticated: false,
    isLoading: true,
    userType: null as string | null,
  });

  // تحديث الحالة عند تغير أي من مصادر المصادقة
  useEffect(() => {
    // الحصول على البيانات من جميع المصادر
    const user = unifiedAuth.user || sessionPersistence.data?.user || sessionPersistence.getUserData();
    const isAuthenticated = unifiedAuth.isAuthenticated || sessionPersistence.isAuthenticated;
    const isLoading = unifiedAuth.isLoading || sessionPersistence.isLoading;
    
    // تحديد نوع المستخدم
    let userType = unifiedAuth.userType;
    
    // إذا لم يتم تحديد نوع المستخدم من unifiedAuth، حاول من sessionPersistence
    if (!userType && user?.roles) {
      if (Array.isArray(user.roles) && user.roles.length > 0) {
        userType = typeof user.roles[0] === 'string' ? user.roles[0] : user.roles[0]?.name;
      }
    }
    
    setAuthState({
      user,
      isAuthenticated,
      isLoading,
      userType,
    });
  }, [
    unifiedAuth.user,
    unifiedAuth.isAuthenticated,
    unifiedAuth.isLoading,
    unifiedAuth.userType,
    sessionPersistence.data,
    sessionPersistence.isAuthenticated,
    sessionPersistence.isLoading,
  ]);

  /**
   * الحصول على بيانات المستخدم من جميع المصادر المتاحة
   */
  const getUserData = () => {
    return authState.user || sessionPersistence.getUserData() || null;
  };

  /**
   * الحصول على رمز الوصول (token) من جميع المصادر المتاحة
   */
  const getAccessToken = () => {
    return sessionPersistence.getAccessToken();
  };

  /**
   * تسجيل الخروج من جميع أنظمة المصادقة
   */
  const logout = async () => {
    try {
      // تسجيل الخروج من unifiedAuth
      await unifiedAuth.logout();
      
      // مسح البيانات المخزنة
      sessionPersistence.clearStoredSession();
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  };

  return {
    ...authState,
    getUserData,
    getAccessToken,
    logout,
    redirectToLogin: unifiedAuth.redirectToLogin,
  };
} 