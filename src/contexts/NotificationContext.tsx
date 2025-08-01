'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { notificationsService } from '@/services/notifications.service';
import { getAuthToken } from '@/lib/auth.service';

interface NotificationContextType {
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshUnreadCount: () => Promise<void>;
  markAllAsRead: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  isLoading: false,
  error: null,
  refreshUnreadCount: async () => {},
  markAllAsRead: async () => false,
});

export const useNotificationContext = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: React.ReactNode;
  userType?: 'pilgrim' | 'office' | 'bus-operator';
  pollingInterval?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  userType = 'pilgrim',
  pollingInterval = 60000 // 1 minute
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  // Get token safely
  const getToken = useCallback(() => {
    // First try to get from session
    if (session?.accessToken) {
      return session.accessToken as string;
    }
    
    // Then try to get from local storage or other sources
    return getAuthToken();
  }, [session]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    if (status === 'authenticated') return true;
    
    // Check token from other sources
    const token = getToken();
    if (token) return true;
    
    // Check if user object exists in localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.id) return true;
      }
    } catch (error) {
      console.warn('Error checking user in localStorage:', error);
    }
    
    // Check isAuthenticated flag in localStorage
    try {
      const isAuthStr = localStorage.getItem('isAuthenticated');
      if (isAuthStr === 'true') return true;
    } catch (error) {
      console.warn('Error checking isAuthenticated in localStorage:', error);
    }
    
    return false;
  }, [status, getToken]);

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated()) return;
    
    try {
      setIsLoading(true);
      
      const token = getToken();
      if (!token) {
        console.warn('Authentication token not found for notifications, skipping refresh');
        return;
      }
      
      // Since getUnreadCount now returns 0 instead of throwing, we don't need nested try/catch
      const count = await notificationsService.getUnreadCount(token, userType);
      setUnreadCount(count);
    } catch (error: any) {
      // Just log the error but don't update error state for background operations
      console.warn('Error in notification refresh process:', error.message || error);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, userType, isAuthenticated]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated()) {
      toast.error('Please login to manage notifications');
      return false;
    }
    
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication error');
        return false;
      }
      
      const success = await notificationsService.markAllAsRead(token, userType);
      
      if (success) {
        setUnreadCount(0);
        toast.success('All notifications marked as read');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast.error(error.message || 'Failed to mark all notifications as read');
      return false;
    }
  }, [getToken, userType, isAuthenticated]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated()) {
      refreshUnreadCount();
    }
  }, [isAuthenticated, refreshUnreadCount]);

  // Set up polling
  useEffect(() => {
    if (!isAuthenticated()) return;
    
    const intervalId = setInterval(() => {
      refreshUnreadCount();
    }, pollingInterval);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, refreshUnreadCount, pollingInterval]);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      if (isAuthenticated()) {
        refreshUnreadCount();
      } else {
        setUnreadCount(0);
      }
    };
    
    window.addEventListener('authDataStored', handleAuthChange);
    window.addEventListener('authDataCleared', handleAuthChange);
    
    return () => {
      window.removeEventListener('authDataStored', handleAuthChange);
      window.removeEventListener('authDataCleared', handleAuthChange);
    };
  }, [isAuthenticated, refreshUnreadCount]);

  const value = {
    unreadCount,
    isLoading,
    error,
    refreshUnreadCount,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 