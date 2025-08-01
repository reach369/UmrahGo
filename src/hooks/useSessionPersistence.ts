'use client';

import { useState, useEffect } from 'react';

// Define types
interface SessionData {
  user: any | null;
  token: string | null;
  expiry: string | null;
}

interface SessionPersistenceReturn {
  data: SessionData | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isAuthenticated: boolean;
  isHydrated: boolean;
  getUserData: () => any | null;
  getUserRole: () => 'office' | 'bus_operator' | 'pilgrim' | 'admin';
  setUserData: (userData: any, token?: string) => void;
  clearStoredSession: () => void;
}

/**
 * Custom hook to handle session persistence across tabs
 * and provide authenticated user data
 */
export function useSessionPersistence(): SessionPersistenceReturn {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Initialize session data from storage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set hydration state
    setIsHydrated(true);

    try {
      // Check for user data in various storage locations
      const storedUserData = localStorage.getItem('user');
      const storedNextAuthUser = localStorage.getItem('nextauth_user');
      
      // Check for tokens
      const storedToken = localStorage.getItem('token');
      const storedNextAuthToken = localStorage.getItem('nextauth_token');
      
      // Use the available data
      const userData = storedUserData ? JSON.parse(storedUserData) : 
                       storedNextAuthUser ? JSON.parse(storedNextAuthUser) : null;
      const token = storedToken || storedNextAuthToken || null;
      
      // Check expiry if available
      const expiryStr = localStorage.getItem('nextauth_session_expires');
      
      if (userData && token) {
        setSessionData({ 
          user: userData, 
          token,
          expiry: expiryStr || null
        });
        setStatus('authenticated');
      } else {
        setSessionData(null);
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      setStatus('unauthenticated');
    }
  }, []);

  // Get current user data
  const getUserData = (): any | null => {
    return sessionData?.user || null;
  };

  // Get user role from stored data
  const getUserRole = (): 'office' | 'bus_operator' | 'pilgrim' | 'admin' => {
    const userData = sessionData?.user;
    if (!userData) return 'pilgrim';
    
    // Debug log to understand the user data structure
    console.log('User data for role detection:', {
      roles: userData.roles,
      umrah_office: userData.umrah_office,
      office: userData.office
    });
    
    // Check if user has roles array
    if (userData.roles && Array.isArray(userData.roles)) {
      // Legacy: roles might be an array of strings
      if (typeof userData.roles[0] === 'string') {
        if (userData.roles.includes('office')) return 'office';
        if (userData.roles.includes('bus_operator') || userData.roles.includes('bus-operator')) return 'bus_operator';
        if (userData.roles.includes('admin')) return 'admin';
      }
      // Modern: roles might be an array of objects with name property
      else if (userData.roles[0] && typeof userData.roles[0] === 'object') {
        try {
          const roleNames = userData.roles.map((role: any) => {
            if (typeof role === 'string') return role;
            return role.name || '';
          }).filter(Boolean);

          console.log('Extracted role names:', roleNames);
          
          if (roleNames.includes('office')) return 'office';
          if (roleNames.includes('bus_operator') || roleNames.includes('bus-operator')) return 'bus_operator';
          if (roleNames.includes('admin')) return 'admin';
        } catch (error) {
          console.error('Error processing roles array:', error);
        }
      }
    }
    
    // Check for umrah_office property
    if (userData.umrah_office) {
      console.log('User has umrah_office property:', userData.umrah_office);
      return 'office';
    }
    
    // Check for office property
    if (userData.office) {
      console.log('User has office property:', userData.office);
      return 'office';
    }
    
    // Default to pilgrim
    return 'pilgrim';
  };

  // Store user data
  const setUserData = (userData: any, token?: string): void => {
    if (!userData) return;

    try {
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('nextauth_user', JSON.stringify(userData));
      
      // Store token if provided
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('nextauth_token', token);
        
        // Set expiry to 30 days from now
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        localStorage.setItem('nextauth_session_expires', expires);
      }
      
      // Update state
      setSessionData({
        user: userData,
        token: token || sessionData?.token || null,
        expiry: localStorage.getItem('nextauth_session_expires') || null
      });
      setStatus('authenticated');
      
      // Dispatch event for other components to update
      window.dispatchEvent(new CustomEvent('auth_state_changed'));
    } catch (error) {
      console.error('Error storing session data:', error);
    }
  };

  // Clear session data
  const clearStoredSession = (): void => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('nextauth_user');
      localStorage.removeItem('nextauth_token');
      localStorage.removeItem('nextauth_session_expires');
      
      setSessionData(null);
      setStatus('unauthenticated');
      
      // Dispatch event for other components to update
      window.dispatchEvent(new CustomEvent('auth_state_changed'));
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  };

  return {
    data: sessionData,
    status,
    isAuthenticated: status === 'authenticated',
    isHydrated,
    getUserData,
    getUserRole,
    setUserData,
    clearStoredSession,
  };
} 