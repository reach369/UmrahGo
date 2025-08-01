/**
 * Pusher Chat Hook
 * Real-time chat functionality using Pusher directly
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { realtimeService, RealtimeMessage, TypingData } from '@/services/realtime.service';
import { getAuthToken } from '@/lib/auth.service';
import { useAuth } from '@/contexts/AuthContext';

export interface UsePusherChatProps {
  chatId?: string;
  userType: string;
  onNewMessage?: (message: RealtimeMessage) => void;
  onTypingIndicator?: (data: TypingData) => void;
  onConnectionStatusChange?: (status: string) => void;
}

export interface UsePusherChatReturn {
  connectionStatus: string;
  sendTypingIndicator: (isTyping: boolean) => void;
  isConnected: boolean;
  typingUsers: Map<number, { name: string; timestamp: number }>;
  retryConnection: () => void;
}

export function usePusherChat({
  chatId,
  userType,
  onNewMessage,
  onTypingIndicator,
  onConnectionStatusChange,
}: UsePusherChatProps): UsePusherChatReturn {
  const { state: authState } = useAuth();
  const user = authState.user;
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [typingUsers, setTypingUsers] = useState<Map<number, { name: string; timestamp: number }>>(new Map());
  const typingTimeoutRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const currentChatIdRef = useRef<string | undefined>(chatId);
  const isMountedRef = useRef<boolean>(false);
  const connectionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update connection status
  const updateConnectionStatus = useCallback((status: string) => {
    if (!isMountedRef.current) return;
    
    setConnectionStatus(status);
    onConnectionStatusChange?.(status);
  }, [onConnectionStatusChange]);

  // Clear typing indicator after timeout
  const clearTypingIndicator = useCallback((userId: number) => {
    if (!isMountedRef.current) return;
    
    setTypingUsers(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
    
    const timeout = typingTimeoutRef.current.get(userId);
    if (timeout) {
      clearTimeout(timeout);
      typingTimeoutRef.current.delete(userId);
    }
  }, []);

  // Handle typing indicator
  const handleTypingIndicator = useCallback((data: TypingData) => {
    if (!isMountedRef.current) return;
    if (data.userId === user?.id) return; // Don't show own typing

    if (data.isTyping) {
      // Clear existing timeout
      const existingTimeout = typingTimeoutRef.current.get(data.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set typing user
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, {
          name: data.userName,
          timestamp: Date.now()
        });
        return newMap;
      });

      // Set timeout to clear after 3 seconds
      const timeout = setTimeout(() => {
        clearTypingIndicator(data.userId);
      }, 3000);
      
      typingTimeoutRef.current.set(data.userId, timeout);
    } else {
      clearTypingIndicator(data.userId);
    }

    onTypingIndicator?.(data);
  }, [user?.id, clearTypingIndicator, onTypingIndicator]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (typeof window === 'undefined' || !chatId) return;
    
    realtimeService().sendTypingIndicator(parseInt(chatId), isTyping);
  }, [chatId]);

  // Function to retry connection
  const retryConnection = useCallback(() => {
    if (!user || !userType) return;
    
    console.log('Manually retrying connection...');
    updateConnectionStatus('connecting');
    
    // This will disconnect first and then reconnect
    realtimeService().disconnect();
    
    // Wait a bit before reconnecting
    setTimeout(() => {
      realtimeService().connect(user.id, userType)
        .then(success => {
          if (success) {
            updateConnectionStatus('connected');
          } else {
            updateConnectionStatus('error');
          }
        })
        .catch(() => updateConnectionStatus('error'));
    }, 500);
  }, [user, userType, updateConnectionStatus]);
  
  // Start periodic connection check
  const startConnectionCheck = useCallback(() => {
    if (connectionCheckIntervalRef.current) {
      clearInterval(connectionCheckIntervalRef.current);
    }
    
    // Check connection every 30 seconds
    connectionCheckIntervalRef.current = setInterval(() => {
      if (user && userType && !realtimeService().isConnected()) {
        console.log('Connection check: reconnecting...');
        realtimeService().connect(user.id, userType);
      }
    }, 30000); // 30 seconds
  }, [user, userType]);

  // Initialize real-time connection
  useEffect(() => {
    // Skip for SSR
    if (typeof window === 'undefined') return;
    
    isMountedRef.current = true;
    
    if (!user || !userType) {
      updateConnectionStatus('no-user');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      updateConnectionStatus('no-auth');
      return;
    }

    // Connect to real-time service
    try {
      updateConnectionStatus('connecting');
      
      realtimeService().connect(user.id, userType)
        .then(success => {
          if (success) {
            updateConnectionStatus('connected');
            startConnectionCheck();
          } else {
            updateConnectionStatus('error');
          }
        })
        .catch(() => updateConnectionStatus('error'));
    } catch (error) {
      console.error('Failed to connect to real-time service:', error);
      updateConnectionStatus('error');
    }

    return () => {
      isMountedRef.current = false;
      
      // Clear all typing timeouts on unmount
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
      
      // Clear connection check interval
      if (connectionCheckIntervalRef.current) {
        clearInterval(connectionCheckIntervalRef.current);
        connectionCheckIntervalRef.current = null;
      }
    };
  }, [user, userType, updateConnectionStatus, startConnectionCheck]);

  // Subscribe to chat channel
  useEffect(() => {
    // Skip for SSR
    if (typeof window === 'undefined') return;
    if (!chatId || !user) return;

    try {
      // Update current chat ID ref
      currentChatIdRef.current = chatId;

      // Subscribe to chat channel
      realtimeService().subscribeToChatChannel(parseInt(chatId));

      // Register message handler
      realtimeService().onMessage(chatId, (message) => {
        // Only handle messages for current chat
        if (isMountedRef.current && currentChatIdRef.current === chatId) {
          onNewMessage?.(message);
        }
      });

      // Register typing handler
      realtimeService().onTyping(chatId, handleTypingIndicator);

      return () => {
        // Leave chat channel
        if (typeof window !== 'undefined') {
          realtimeService().leaveChatChannel(parseInt(chatId));
          realtimeService().offMessage(chatId);
          realtimeService().offTyping(chatId);
        }
        
        // Clear typing users when leaving chat
        if (isMountedRef.current) {
          setTypingUsers(new Map());
        }
      };
    } catch (error) {
      console.error('Error subscribing to chat channel:', error);
      updateConnectionStatus('error');
    }
  }, [chatId, onNewMessage, handleTypingIndicator, user, updateConnectionStatus]);

  return {
    connectionStatus,
    sendTypingIndicator,
    isConnected: typeof window !== 'undefined' && realtimeService().isConnected(),
    typingUsers,
    retryConnection
  };
} 