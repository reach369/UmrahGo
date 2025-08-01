'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSound } from 'use-sound';
import { realtimeService } from '@/services/realtime.service';
import { notificationService } from '@/services/notifications.service';

export interface Notification {
  is_read: boolean;
  category: string;
  id: number;
  type: string;
  title: string;
  message?: string;
  body?: string;
  content?: string;
  data?: Record<string, any>;
  read_at: string | null;
  action_url?: string;
  link?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  loading: boolean;
  error: Error | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: number) => Promise<boolean>;
  deleteAllNotifications: () => Promise<boolean>;
  bulkAction: (ids: (string | number)[], action: 'read' | 'unread' | 'delete') => Promise<boolean>;
  clearNotifications: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state: authState } = useAuth();
  const user = authState.user;

  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Initialize sound
  const [playSound] = useSound('/sounds/notification.mp3', { volume: 0.5 });

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(1, 20);
      
      if (response && response.data) {
        setNotifications(response.data);
        setUnreadCount(response.meta?.unread_count || 0);
        setTotalCount(response.meta?.total || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: number): Promise<boolean> => {
    try {
      const success = await notificationService.markAsRead(id);
      
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const success = await notificationService.markAllAsRead();
      
      if (success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
        );
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: number): Promise<boolean> => {
    try {
      const success = await notificationService.deleteNotification(id);
      
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Update unread count if needed
        const wasUnread = notifications.find(n => n.id === id && !n.read_at);
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        setTotalCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [notifications]);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async (): Promise<boolean> => {
    try {
      const success = await notificationService.deleteAllNotifications();
      
      if (success) {
        setNotifications([]);
        setUnreadCount(0);
        setTotalCount(0);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      return false;
    }
  }, []);

  // Bulk action on notifications
  const bulkAction = useCallback(async (ids: (string | number)[], action: 'read' | 'unread' | 'delete'): Promise<boolean> => {
    try {
      // Convert string IDs to numbers if needed
      const numericIds = ids.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
      
      // Map to API actions
      const apiAction = action === 'read' ? 'mark_read' : 
                        action === 'unread' ? 'mark_unread' : 
                        'delete';
      
      // Call service
      const success = await notificationService.bulkAction(numericIds, apiAction);
      
      if (success) {
        // Update state based on action
        switch (action) {
          case 'read':
            setNotifications(prev => 
              prev.map(n => numericIds.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n)
            );
            // Update unread count
            const newUnreadCount = notifications.reduce((count, n) => 
              !n.read_at && !numericIds.includes(n.id) ? count + 1 : count, 0);
            setUnreadCount(newUnreadCount);
            break;
            
          case 'unread':
            setNotifications(prev => 
              prev.map(n => numericIds.includes(n.id) ? { ...n, read_at: null } : n)
            );
            // Update unread count
            const unreadItems = numericIds.filter(id => 
              notifications.find(n => n.id === id && n.read_at !== null)
            ).length;
            setUnreadCount(prev => prev + unreadItems);
            break;
            
          case 'delete':
            setNotifications(prev => prev.filter(n => !numericIds.includes(n.id)));
            // Update unread count
            const deletedUnread = notifications.filter(n => 
              numericIds.includes(n.id) && !n.read_at
            ).length;
            setUnreadCount(prev => Math.max(0, prev - deletedUnread));
            setTotalCount(prev => Math.max(0, prev - numericIds.length));
            break;
        }
        
        return true;
      }
      return false;
    } catch (err) {
      console.error(`Error performing bulk action ${action}:`, err);
      return false;
    }
  }, [notifications]);

  // Clear notifications (local only)
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setTotalCount(0);
  }, []);

  // Setup real-time notifications
  useEffect(() => {
    if (!user?.id) return;
    
    const realtime = realtimeService();
    
    // Connect to realtime service
    realtime.connect(user.id, user.roles?.[0] || 'user');
    
    // Handle new notification
    const handleNewNotification = (notification: any) => {
      console.log('New notification received:', notification);
      
      // Create a standardized notification object
      const newNotification: Notification = {
        id: notification.id,
        type: notification.type || 'system',
        title: notification.title || 'New notification',
        message: notification.message || notification.body || notification.content,
        content: notification.content || notification.message || notification.body,
        data: notification.data,
        read_at: null,
        action_url: notification.action_url || notification.link,
        link: notification.link || notification.action_url,
        priority: notification.priority || 'normal',
        created_at: notification.created_at || new Date().toISOString(),
        updated_at: notification.updated_at || new Date().toISOString(),
      };
      
      // Add to state
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      setTotalCount(prev => prev + 1);
      
      // Play sound if enabled
      if (soundEnabled) {
        playSound();
      }
      
      // Show toast for high priority notifications
      if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
        toast(newNotification.title, {
          description: newNotification.message || newNotification.content,
          action: {
            label: 'View',
            onClick: () => markAsRead(newNotification.id)
          }
        });
      }
    };
    
    // Register notification handler
    realtime.onNotification(handleNewNotification);
    
    // Initial load
    fetchNotifications();
    
    // Cleanup
    return () => {
      realtime.offNotification(handleNewNotification);
    };
  }, [user?.id, fetchNotifications, markAsRead, playSound, soundEnabled]);

  // Value for context
  const value = {
    notifications,
    unreadCount,
    totalCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    bulkAction,
    clearNotifications,
    soundEnabled,
    setSoundEnabled,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationProvider; 