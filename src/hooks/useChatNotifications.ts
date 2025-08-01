/**
 * Chat Notifications Hook
 * Manage chat notifications using Pusher
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { realtimeService } from '@/services/realtime.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ChatNotification {
  id: string;
  type: 'message' | 'system';
  chatId: number;
  senderId: number;
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: any;
}

export default function useChatNotifications() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const user = authState.user;
  
  // Get the current locale from URL or default to 'en'
  const pathSegments = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
  const currentLocale = pathSegments.length > 1 ? pathSegments[1] : 'en';

  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Handle new notification
  const handleNewNotification = useCallback((notification: any) => {
    if (typeof window === 'undefined') return;
    
    if (notification && notification.type === 'message') {
      // Add new notification
      const newNotification: ChatNotification = {
        id: notification.id || `temp-${Date.now()}`,
        type: notification.type || 'message',
        chatId: notification.chat_id,
        senderId: notification.sender_id,
        senderName: notification.sender_name || 'Unknown',
        message: notification.message,
        timestamp: notification.created_at,
        isRead: false,
        data: notification.data
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      toast(newNotification.senderName, {
        description: newNotification.message,
        action: {
          label: 'View',
          onClick: () => viewChat(newNotification.chatId)
        }
      });
      
      // Play notification sound
      playNotificationSound();
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
    
    setUnreadCount(0);
  }, []);

  // View chat
  const viewChat = useCallback((chatId: number) => {
    router.push(`/${currentLocale}/chat?id=${chatId}`);
  }, [router, currentLocale]);

  // Clear notification
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      const newNotifications = prev.filter(n => n.id !== notificationId);
      
      // Update unread count if needed
      if (notification && !notification.isRead) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      
      return newNotifications;
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Subscribe to notifications
  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;
    
    // Register notification handler
    realtimeService().onNotification(handleNewNotification);
    
    return () => {
      // Unregister notification handler
      realtimeService().offNotification(handleNewNotification);
    };
  }, [user, handleNewNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    viewChat
  };
} 