/**
 * Enhanced Chat WebSocket Hook
 * Professional implementation with auto-reconnection, error handling, and real-time features
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { getAuthToken } from '@/lib/auth.service';

// Enhanced Types
export interface WebSocketMessage {
  id: string | number;
  chat_id?: string | number;
  user_id?: string | number;
  sender_id?: string | number;
  sender_name?: string;
  sender_avatar?: string;
  message?: string;
  content?: string;
  type?: string;
  status?: string;
  priority?: string;
  created_at?: string;
  sent_at?: string;
  localId?: string;
  metadata?: any;
}

export interface TypingIndicator {
  userId: string | number;
  chatId: string | number;
  isTyping: boolean;
  timestamp: string;
}

export interface MessageStatusUpdate {
  messageId: string | number;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface UseChatWebSocketProps {
  chatId?: string;
  userType: 'pilgrim' | 'office' | 'bus_operator' | 'admin';
  onNewMessage?: (message: WebSocketMessage) => void;
  onTypingIndicator?: (indicator: TypingIndicator) => void;
  onMessageStatusUpdate?: (messageId: string | number, status: Partial<MessageStatusUpdate>) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

export interface UseChatWebSocketReturn {
  connectionStatus: ConnectionStatus;
  sendMessage: (message: Partial<WebSocketMessage>) => Promise<boolean>;
  sendTypingIndicator: (isTyping: boolean) => Promise<boolean>;
  markAsRead: (messageId: string | number) => Promise<boolean>;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  unreadCount: number;
  isOnline: boolean;
}

// WebSocket configuration
const WS_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8000',
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  RECONNECT_INTERVAL: 5000, // 5 seconds
  MAX_RECONNECT_ATTEMPTS: 5,
  MESSAGE_TIMEOUT: 10000, // 10 seconds
};

// Message types
const MESSAGE_TYPES = {
  // Incoming
  CHAT_MESSAGE: 'chat.message',
  TYPING_INDICATOR: 'chat.typing',
  MESSAGE_STATUS: 'chat.message_status',
  USER_ONLINE: 'user.online',
  USER_OFFLINE: 'user.offline',
  HEARTBEAT_RESPONSE: 'heartbeat.response',
  ERROR: 'error',
  
  // Outgoing
  SEND_MESSAGE: 'chat.send_message',
  TYPING_START: 'chat.typing_start',
  TYPING_STOP: 'chat.typing_stop',
  MARK_READ: 'chat.mark_read',
  JOIN_CHAT: 'chat.join',
  LEAVE_CHAT: 'chat.leave',
  HEARTBEAT: 'heartbeat',
};

export function useChatWebSocket({
  chatId,
  userType,
  onNewMessage,
  onTypingIndicator,
  onMessageStatusUpdate,
  onConnectionStatusChange,
  onError,
  autoConnect = true,
  reconnectAttempts = WS_CONFIG.MAX_RECONNECT_ATTEMPTS,
  reconnectInterval = WS_CONFIG.RECONNECT_INTERVAL,
  heartbeatInterval = WS_CONFIG.HEARTBEAT_INTERVAL,
}: UseChatWebSocketProps): UseChatWebSocketReturn {
  
  // State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Refs for persistent data
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const messageQueueRef = useRef<Array<{ message: any; resolve: (success: boolean) => void }>>([]);
  const pendingMessagesRef = useRef<Map<string, { timeout: NodeJS.Timeout; resolve: (success: boolean) => void }>>(new Map());
  const mountedRef = useRef(true);

  // Update connection status with callback
  const updateConnectionStatus = useCallback((status: ConnectionStatus) => {
    if (!mountedRef.current) return;
    
    setConnectionStatus(status);
    onConnectionStatusChange?.(status);
    
    // Log status changes in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`WebSocket status changed to: ${status}`);
    }
  }, [onConnectionStatusChange]);

  // Handle WebSocket errors
  const handleError = useCallback((error: Error) => {
    console.error('WebSocket error:', error);
    onError?.(error);
    updateConnectionStatus('error');
  }, [onError, updateConnectionStatus]);

  // Process pending message queue
  const processPendingQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && messageQueueRef.current.length > 0) {
      const queue = [...messageQueueRef.current];
      messageQueueRef.current = [];
      
      queue.forEach(({ message, resolve }) => {
        try {
          wsRef.current!.send(JSON.stringify(message));
          resolve(true);
        } catch (error) {
          console.error('Error sending queued message:', error);
          resolve(false);
        }
      });
    }
  }, []);

  // Send heartbeat
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          type: MESSAGE_TYPES.HEARTBEAT,
          timestamp: new Date().toISOString()
        }));
        
        // Set timeout for heartbeat response
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
        }
        
        heartbeatTimeoutRef.current = setTimeout(() => {
          console.warn('Heartbeat timeout - connection may be lost');
          reconnect();
        }, 10000); // 10 seconds timeout
        
      } catch (error) {
        console.error('Error sending heartbeat:', error);
        reconnect();
      }
    }
  }, []);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, heartbeatInterval);
  }, [sendHeartbeat, heartbeatInterval]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case MESSAGE_TYPES.CHAT_MESSAGE:
          if (onNewMessage) {
            onNewMessage(data.payload || data);
            setUnreadCount(prev => prev + 1);
          }
          break;
          
        case MESSAGE_TYPES.TYPING_INDICATOR:
          if (onTypingIndicator) {
            onTypingIndicator(data.payload || data);
          }
          break;
          
        case MESSAGE_TYPES.MESSAGE_STATUS:
          if (onMessageStatusUpdate) {
            onMessageStatusUpdate(data.messageId, data.payload || data);
          }
          
          // Handle message confirmation
          if (data.localId && pendingMessagesRef.current.has(data.localId)) {
            const pending = pendingMessagesRef.current.get(data.localId);
            if (pending) {
              clearTimeout(pending.timeout);
              pending.resolve(true);
              pendingMessagesRef.current.delete(data.localId);
            }
          }
          break;
          
        case MESSAGE_TYPES.USER_ONLINE:
        case MESSAGE_TYPES.USER_OFFLINE:
          // Handle user presence updates
          break;
          
        case MESSAGE_TYPES.HEARTBEAT_RESPONSE:
          // Clear heartbeat timeout
          if (heartbeatTimeoutRef.current) {
            clearTimeout(heartbeatTimeoutRef.current);
            heartbeatTimeoutRef.current = null;
          }
          break;
          
        case MESSAGE_TYPES.ERROR:
          handleError(new Error(data.message || 'WebSocket error received'));
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [onNewMessage, onTypingIndicator, onMessageStatusUpdate, handleError]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }
    
    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    const token = getAuthToken();
    if (!token) {
      handleError(new Error('No authentication token available'));
      return;
    }
    
    updateConnectionStatus('connecting');
    
    try {
      // Construct WebSocket URL with authentication
      const wsUrl = `${WS_CONFIG.BASE_URL}/ws/chat?token=${encodeURIComponent(token)}&userType=${userType}${chatId ? `&chatId=${chatId}` : ''}`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        updateConnectionStatus('connected');
        reconnectCountRef.current = 0;
        
        // Start heartbeat
        startHeartbeat();
        
        // Process pending messages
        processPendingQueue();
        
        // Join chat if chatId is provided
        if (chatId) {
          wsRef.current?.send(JSON.stringify({
            type: MESSAGE_TYPES.JOIN_CHAT,
            chatId,
            userType
          }));
        }
      };
      
      wsRef.current.onmessage = handleMessage;
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        stopHeartbeat();
        
        if (event.code !== 1000) { // Not a normal closure
          updateConnectionStatus('disconnected');
          
          // Auto-reconnect if enabled and within limits
          if (autoConnect && reconnectCountRef.current < reconnectAttempts && mountedRef.current) {
            scheduleReconnect();
          }
        } else {
          updateConnectionStatus('disconnected');
        }
      };
      
      wsRef.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        handleError(new Error('WebSocket connection error'));
      };
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      handleError(error as Error);
    }
  }, [
    chatId, 
    userType, 
    autoConnect, 
    reconnectAttempts, 
    handleError, 
    updateConnectionStatus, 
    startHeartbeat, 
    processPendingQueue, 
    handleMessage, 
    stopHeartbeat
  ]);

  // Schedule reconnection
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectCountRef.current++;
    updateConnectionStatus('reconnecting');
    
    const delay = reconnectInterval * Math.pow(2, Math.min(reconnectCountRef.current - 1, 5)); // Exponential backoff
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        connect();
      }
    }, delay);
  }, [reconnectInterval, connect, updateConnectionStatus]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    if (wsRef.current) {
      // Leave chat if chatId is provided
      if (chatId) {
        wsRef.current.send(JSON.stringify({
          type: MESSAGE_TYPES.LEAVE_CHAT,
          chatId
        }));
      }
      
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    
    updateConnectionStatus('disconnected');
  }, [chatId, stopHeartbeat, updateConnectionStatus]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // Send message with retry logic
  const sendMessage = useCallback(async (message: Partial<WebSocketMessage>): Promise<boolean> => {
    return new Promise((resolve) => {
      const messageWithMetadata = {
        type: MESSAGE_TYPES.SEND_MESSAGE,
        chatId,
        ...message,
        timestamp: new Date().toISOString(),
        localId: message.localId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify(messageWithMetadata));
          
          // Set timeout for message confirmation
          const timeout = setTimeout(() => {
            pendingMessagesRef.current.delete(messageWithMetadata.localId);
            resolve(false);
          }, WS_CONFIG.MESSAGE_TIMEOUT);
          
          pendingMessagesRef.current.set(messageWithMetadata.localId, { timeout, resolve });
          
        } catch (error) {
          console.error('Error sending message:', error);
          resolve(false);
        }
      } else {
        // Queue message for later
        messageQueueRef.current.push({ message: messageWithMetadata, resolve });
        
        // Try to reconnect if not connected
        if (connectionStatus === 'disconnected') {
          connect();
        }
      }
    });
  }, [chatId, connectionStatus, connect]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (isTyping: boolean): Promise<boolean> => {
    return new Promise((resolve) => {
      const message = {
        type: isTyping ? MESSAGE_TYPES.TYPING_START : MESSAGE_TYPES.TYPING_STOP,
        chatId,
        timestamp: new Date().toISOString()
      };
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify(message));
          resolve(true);
        } catch (error) {
          console.error('Error sending typing indicator:', error);
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }, [chatId]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string | number): Promise<boolean> => {
    return new Promise((resolve) => {
      const message = {
        type: MESSAGE_TYPES.MARK_READ,
        chatId,
        messageId,
        timestamp: new Date().toISOString()
      };
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify(message));
          setUnreadCount(prev => Math.max(0, prev - 1));
          resolve(true);
        } catch (error) {
          console.error('Error marking message as read:', error);
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }, [chatId]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (connectionStatus === 'disconnected' && autoConnect) {
        connect();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      updateConnectionStatus('disconnected');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectionStatus, autoConnect, connect, updateConnectionStatus]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && isOnline) {
      connect();
    }
    
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [autoConnect, isOnline, connect, disconnect]);

  // Reconnect when chatId changes
  useEffect(() => {
    if (chatId && connectionStatus === 'connected') {
      // Leave previous chat and join new one
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: MESSAGE_TYPES.JOIN_CHAT,
          chatId,
          userType
        }));
      }
    }
  }, [chatId, connectionStatus, userType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all pending messages
      pendingMessagesRef.current.forEach(({ timeout, resolve }) => {
        clearTimeout(timeout);
        resolve(false);
      });
      pendingMessagesRef.current.clear();
      
      // Clear message queue
      messageQueueRef.current.forEach(({ resolve }) => resolve(false));
      messageQueueRef.current = [];
      
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionStatus,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    connect,
    disconnect,
    reconnect,
    unreadCount,
    isOnline,
  };
} 