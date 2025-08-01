'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getAuthToken } from '@/lib/auth.service';

export interface UnifiedUser {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  profile_photo?: string;
  profile_photo_path?: string;
  roles?: string[] | any[];
  umrah_office?: any;
  office?: any;
}

export interface UnifiedAuthState {
  user: UnifiedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  userType: 'pilgrim' | 'office' | 'bus_operator' | 'admin';
}

export function useUnifiedAuth(): UnifiedAuthState {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to determine user role
  const getUserType = (user: any): 'office' | 'bus_operator' | 'pilgrim' | 'admin' => {
    if (!user) return 'pilgrim';
    
    // Check if user has roles array
    if (user.roles && Array.isArray(user.roles)) {
      // Legacy: roles might be an array of strings
      if (typeof user.roles[0] === 'string') {
        if (user.roles.includes('office')) return 'office';
        if (user.roles.includes('bus_operator') || user.roles.includes('bus-operator')) return 'bus_operator';
        if (user.roles.includes('admin')) return 'admin';
      }
      // Modern: roles might be an array of objects with name property
      else if (user.roles[0] && typeof user.roles[0] === 'object') {
        try {
          const roleNames = user.roles.map((role: any) => {
            if (typeof role === 'string') return role;
            if (role && typeof role === 'object' && 'name' in role) return role.name;
            return '';
          }).filter(Boolean);
          
          if (roleNames.includes('office')) return 'office';
          if (roleNames.includes('bus_operator') || roleNames.includes('bus-operator')) return 'bus_operator';
          if (roleNames.includes('admin')) return 'admin';
        } catch (error) {
          console.error('Error processing roles array:', error);
        }
      }
    }
    
    // Check for umrah_office property
    if ('umrah_office' in user && user.umrah_office) {
      return 'office';
    }
    
    // Check for office property
    if (user.office) {
      return 'office';
    }
    
    // Default to pilgrim
    return 'pilgrim';
  };

  if (!mounted) {
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      token: null,
      userType: 'pilgrim'
    };
  }

  const isLoading = status === 'loading';
  const user = session?.user as UnifiedUser | null;
  const isAuthenticated = !!user && status === 'authenticated';
  const token = getAuthToken();
  const userType = getUserType(user);

  return {
    user,
    isLoading,
    isAuthenticated,
    token,
    userType
  };
} 