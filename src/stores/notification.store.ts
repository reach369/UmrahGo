/**
 * Notification Store - Real-time Notification State Management
 * Using Zustand for efficient notification state management with real-time updates
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { notificationService } from '@/services/notification.service';
import { realtimeService, type RealtimeMessage } from '@/services/realtime.service';
import { toast } from 'sonner';

// Types
export interface Notification {
  id: string;
  type: 'message' | 'booking' | 'payment' | 'system' | 'wallet' | 'document' | 'general';
  title: string;
  message: string;
  content?: string;
  is_read: boolean;
  read_at?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data?: any;
  created_at: string;
  updated_at: string;
  action_url?: string;
  action_text?: string;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

// Modify the ChatNotification type to match what we receive from realtime service
export interface ChatNotification {
  id: string | number;
  title?: string;
  message: string;
  created_at: string;
  read_at?: string;
  data?: any;
}

export interface NotificationState {
  // Data
  notifications: Notification[];
  unreadCount: number;
  
  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  hasMore: boolean;
  totalCount: number;
  
  // Actions
  loadNotifications: (page?: number, append?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  
  // Real-time
  addNotification: (notification: Notification | ChatNotification) => void;
  updateNotification: (notificationId: string, updates: Partial<Notification>) => void;
  
  // Utilities
  getNotificationById: (notificationId: string) => Notification | undefined;
  getUnreadNotifications: () => Notification[];
  reset: () => void;
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isRefreshing: false,
  error: null,
  currentPage: 1,
  hasMore: true,
  totalCount: 0
};

export const useNotificationStore = create<NotificationState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      loadNotifications: async (page = 1, append = false) => {
        const state = get();
        
        if (!append) {
          set({ isLoading: true, error: null });
        } else {
          set({ isRefreshing: true });
        }
        
        try {
          const result = await notificationService.getNotifications(page, 20);
          
          set((state) => ({
            notifications: append 
              ? [...state.notifications, ...(result.notifications as Notification[])]
              : result.notifications,
            unreadCount: result.unread_count,
            totalCount: result.total,
            currentPage: page,
            hasMore: result.total > page * 20,
            isLoading: false,
            isRefreshing: false,
            error: null
          }));
          
        } catch (error: any) {
          console.error('Error loading notifications:', error);
          set({
            isLoading: false,
            isRefreshing: false,
            error: 'خطأ في تحميل الإشعارات'
          });
        }
      },

      markAsRead: async (notificationId) => {
        try {
          const success = await notificationService.markAsRead(notificationId);
          
          if (success) {
            set((state) => ({
              notifications: state.notifications.map(n => 
                n.id === notificationId 
                  ? { ...n, is_read: true, read_at: new Date().toISOString() }
                  : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1)
            }));
          } else {
            throw new Error('Failed to mark as read');
          }
          
        } catch (error) {
          console.error('Error marking notification as read:', error);
          toast.error('خطأ في تحديد الإشعار كمقروء');
        }
      },

      markAllAsRead: async () => {
        try {
          const success = await notificationService.markAllAsRead();
          
          if (success) {
            set((state) => ({
              notifications: state.notifications.map(n => ({
                ...n,
                is_read: true,
                read_at: new Date().toISOString()
              })),
              unreadCount: 0
            }));
            toast.success('تم تحديد جميع الإشعارات كمقروءة');
          } else {
            throw new Error('Failed to mark all as read');
          }
          
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
          toast.error('خطأ في تحديد الإشعارات كمقروءة');
        }
      },

      deleteNotification: async (notificationId) => {
        try {
          const success = await notificationService.deleteNotification(notificationId);
          
          if (success) {
            set((state) => {
              const notification = state.notifications.find(n => n.id === notificationId);
              const wasUnread = notification && !notification.is_read;
              
              return {
                notifications: state.notifications.filter(n => n.id !== notificationId),
                unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
                totalCount: Math.max(0, state.totalCount - 1)
              };
            });
            toast.success('تم حذف الإشعار');
          } else {
            throw new Error('Failed to delete notification');
          }
          
        } catch (error) {
          console.error('Error deleting notification:', error);
          toast.error('خطأ في حذف الإشعار');
        }
      },

      refreshUnreadCount: async () => {
        try {
          const count = await notificationService.getUnreadCount();
          set({ unreadCount: count });
        } catch (error) {
          console.error('Error refreshing unread count:', error);
        }
      },

      addNotification: (notification) => {
        // Convert ChatNotification to Notification if needed
        const newNotification: Notification = {
          id: notification.id.toString(),
          type: (notification as any).type || 'general',
          title: (notification as any).title || notification.title,
          message: (notification as any).message || (notification as any).body || '',
          content: (notification as any).content || (notification as any).body || '',
          is_read: false,
          priority: 'normal',
          data: (notification as any).data,
          created_at: notification.created_at,
          updated_at: notification.created_at,
          read_at: (notification as any).read_at
        };
        
        set((state) => {
          // Check if notification already exists
          const exists = state.notifications.some(n => n.id === newNotification.id);
          if (exists) return state;
          
          return {
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
            totalCount: state.totalCount + 1
          };
        });
        
        // Show toast notification
        toast.info(newNotification.title, {
          description: newNotification.message,
          duration: 5000,
          action: newNotification.action_url ? {
            label: newNotification.action_text || 'عرض',
            onClick: () => {
              if (newNotification.action_url) {
                window.location.href = newNotification.action_url;
              }
            }
          } : undefined
        });
        
        // Play notification sound
        try {
          const audio = new Audio('/sounds/notification.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Silently fail if sound cannot be played
          });
        } catch (error) {
          // Silently fail
        }
      },

      updateNotification: (notificationId, updates) => {
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === notificationId ? { ...n, ...updates } : n
          )
        }));
      },

      getNotificationById: (notificationId) => {
        return get().notifications.find(n => n.id === notificationId);
      },

      getUnreadNotifications: () => {
        return get().notifications.filter(n => !n.is_read);
      },

      reset: () => {
        set(initialState);
      }
    })),
    {
      name: 'notification-store'
    }
  )
);

// Real-time event listeners
if (typeof window !== 'undefined') {
  try {
    // Initialize realtime service safely with error handling
    const service = realtimeService();
    if (service) {
      service.onNotification((notification) => {
        useNotificationStore.getState().addNotification(notification);
      });
      
      // Periodic refresh of unread count (every 30 seconds)
      setInterval(() => {
        useNotificationStore.getState().refreshUnreadCount();
      }, 30000);
    }
  } catch (error) {
    console.error('Failed to initialize realtime notification listeners:', error);
  }
} 