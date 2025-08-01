import { useNotifications as useNotificationsProvider } from '@/providers/NotificationProvider';

/**
 * Hook for accessing the notifications system
 * 
 * This is a wrapper around the NotificationProvider to maintain compatibility
 * with existing code that uses useNotifications hook.
 */
export function useNotifications(options = { enableRealtime: true }) {
  // Get notifications from the provider
  const {
    notifications,
    unreadCount,
    totalCount,
    loading: isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationsProvider();
  
  return {
    notifications,
    isLoading,
    error,
    refetch: fetchNotifications,
    totalCount,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
} 