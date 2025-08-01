'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChatWebSocket, WebSocketMessage, ConnectionStatus } from './useChatWebSocket';
import chatService from '@/services/chat.service';
import { getAuthToken } from '@/lib/auth.service';

interface ChatMessage {
  id: string | number;
  message: string;
  chat_id: number;
  user_id?: number;
  sender_id: number;
  sender?: {
    id: number;
    name: string;
    email: string;
    profile_photo_path?: string;
  };
  type: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  updated_at: string;
}

interface UseChatWithFallbackProps {
  chatId?: string;
  userType: 'pilgrim' | 'office' | 'bus_operator' | 'admin';
  onNewMessage?: (message: ChatMessage) => void;
  onMessageStatusUpdate?: (messageId: string | number, status: string) => void;
  onTypingStatusChange?: (userId: string, isTyping: boolean) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
  pollingInterval?: number;
  enableWebSocket?: boolean;
}

interface UseChatWithFallbackReturn {
  sendMessage: (message: { message: string; [key: string]: any }) => Promise<any>;
  markAsRead: (messageId: string) => Promise<boolean>;
  sendTypingIndicator: (isTyping: boolean) => void;
  connectionStatus: ConnectionStatus;
  isUsingFallback: boolean;
  reconnect: () => void;
}

/**
 * Custom hook that combines WebSocket and API for chat messaging
 * with automatic fallback to API when WebSocket is unavailable
 */
export function useChatWithFallback({
  chatId,
  userType,
  onNewMessage,
  onMessageStatusUpdate,
  onTypingStatusChange,
  onConnectionStatusChange,
  pollingInterval = 10000, // Default polling interval when using fallback API
  enableWebSocket = true // Allow disabling WebSocket completely
}: UseChatWithFallbackProps): UseChatWithFallbackReturn {
  // State
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  // Refs
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const lastPollRef = useRef<Date>(new Date());
  const messageCountRef = useRef<number>(0);
  
  // Format WebSocket message to ChatMessage
  const normalizeMessage = useCallback((msg: any): ChatMessage => {
    return {
      id: msg.id || `temp-${Date.now()}`,
      chat_id: parseInt(msg.chat_id?.toString() || msg.chatId?.toString() || chatId || '0'),
      user_id: msg.user_id || msg.sender_id || msg.senderId || 0,
      sender_id: msg.sender_id || msg.user_id || 0,
      sender: msg.sender || {
        id: msg.user_id || msg.sender_id || 0,
        name: msg.sender_name || msg.senderName || 'Unknown',
        email: '',
        profile_photo_path: msg.sender_avatar || msg.senderAvatar
      },
      message: msg.message || msg.content || '',
      type: msg.type || msg.content_type || msg.contentType || 'text',
      status: msg.status || 'sent',
      created_at: msg.created_at || msg.sent_at || msg.sentAt || new Date().toISOString(),
      updated_at: msg.updated_at || new Date().toISOString()
    };
  }, [chatId]);

  // Use WebSocket hook
  const { 
    sendMessage: sendWebSocketMessage, 
    markAsRead: markAsReadWebSocket,
    sendTypingIndicator: sendWSTypingIndicator, 
    connectionStatus,
    reconnect: reconnectWebSocket
  } = useChatWebSocket({
    chatId,
    userType,
    onNewMessage: (message) => {
      if (onNewMessage) {
        const normalizedMessage = normalizeMessage(message);
        onNewMessage(normalizedMessage);
      }
      // Update last message timestamp for polling
      if (message.created_at) {
        setLastMessageTimestamp(message.created_at);
      }
      messageCountRef.current += 1;
    },
    onMessageStatusUpdate: (messageId, status) => {
      if (onMessageStatusUpdate) {
        onMessageStatusUpdate(messageId, status.status || 'sent');
      }
    },
    onTypingIndicator: (indicator) => {
      if (onTypingStatusChange) {
        onTypingStatusChange(indicator.userId.toString(), indicator.isTyping);
      }
    },
    onConnectionStatusChange: (status) => {
      // Handle connection status change
      if (onConnectionStatusChange) {
        onConnectionStatusChange(status);
      }
      
      // Switch to fallback when connection fails
      if (status === 'error' || status === 'disconnected') {
        setIsUsingFallback(true);
      } else if (status === 'connected') {
        setIsUsingFallback(false);
      }
    },
    autoConnect: enableWebSocket,
    reconnectAttempts: 3
  });

  // Send message - Try WebSocket first, fallback to API
  const sendMessage = useCallback(async (messageData: { message: string; [key: string]: any }) => {
    const token = getAuthToken();
    if (!token || !chatId) {
      throw new Error('Missing token or chatId');
    }
    
    // If WebSocket is available and not in fallback mode, try to use it
    if (
      enableWebSocket && 
      !isUsingFallback && 
      connectionStatus === 'connected' && 
      sendWebSocketMessage
    ) {
      try {
        const wsResult = await sendWebSocketMessage({
          message: messageData.message,
          chat_id: chatId,
          ...messageData
        });
        
        if (wsResult) {
          return { success: true };
        }
      } catch (error) {
        console.warn('WebSocket message send failed, falling back to API', error);
      }
    }
    
    // Fallback to API or primary method if WebSocket is disabled
    try {
      const response = await chatService.sendMessage(
        token, 
        chatId,
        messageData.message,
        userType
      );
      
      // Start polling after sending a message via API to get updates
      if (!isPolling) {
        startPolling();
      }
      
      return response;
    } catch (error) {
      console.error('Failed to send message via API:', error);
      throw error;
    }
  }, [
    chatId, 
    userType, 
    isUsingFallback, 
    connectionStatus, 
    enableWebSocket, 
    sendWebSocketMessage,
    isPolling
  ]);

  // Mark message as read - Try WebSocket first, fallback to API
  const markAsRead = useCallback(async (messageId: string): Promise<boolean> => {
    // Try WebSocket first if available
    if (
      enableWebSocket && 
      !isUsingFallback && 
      connectionStatus === 'connected' && 
      markAsReadWebSocket
    ) {
      try {
        const wsResult = await markAsReadWebSocket(messageId);
        if (wsResult) {
          return true;
        }
      } catch (error) {
        console.warn('WebSocket markAsRead failed, falling back to API', error);
      }
    }
    
    // Fallback to API
    try {
      const token = getAuthToken();
      if (!token || !chatId) {
        return false;
      }
      
      const response = await chatService.markAsRead(chatId, token, userType);
      return response.success || false;
    } catch (error) {
      console.error('Failed to mark message as read via API:', error);
      return false;
    }
  }, [
    chatId, 
    userType, 
    isUsingFallback, 
    connectionStatus, 
    enableWebSocket, 
    markAsReadWebSocket
  ]);

  // Typing indicator - WebSocket only (no API fallback for typing)
  const sendTypingIndicator = useCallback((isTyping: boolean): void => {
    if (
      enableWebSocket && 
      !isUsingFallback && 
      connectionStatus === 'connected' && 
      sendWSTypingIndicator
    ) {
      sendWSTypingIndicator(isTyping).catch(error => {
        console.warn('Failed to send typing indicator:', error);
      });
    }
  }, [
    isUsingFallback, 
    connectionStatus, 
    enableWebSocket, 
    sendWSTypingIndicator
  ]);

  // Start polling for new messages when using fallback API
  const startPolling = useCallback(() => {
    if (isPolling || !chatId) return;
    
    setIsPolling(true);
    
    const pollForMessages = async () => {
      if (!mountedRef.current) return;
      
      try {
        const token = getAuthToken();
        if (!token) return;
        
        const now = new Date();
        // Only poll if enough time has passed
        if (now.getTime() - lastPollRef.current.getTime() >= pollingInterval * 0.8) {
          lastPollRef.current = now;
          
          const messages = await chatService.getMessages(token, chatId, userType);
          
          if (Array.isArray(messages) && messages.length > 0) {
            // Find new messages since last timestamp
            const newMessages = lastMessageTimestamp 
              ? messages.filter(msg => {
                  const msgDate = new Date(msg.created_at);
                  const lastDate = new Date(lastMessageTimestamp);
                  return msgDate > lastDate;
                })
              : messages;
              
            // Get new messages that weren't sent by us
            const previousCount = messageCountRef.current;
            
            // Process new messages
            if (newMessages.length > 0) {
              newMessages.forEach(msg => {
                const normalizedMessage = normalizeMessage(msg);
                onNewMessage?.(normalizedMessage);
              });
              
              // Update last message timestamp
              const latestMessage = messages.sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              })[0];
              
              if (latestMessage?.created_at) {
                setLastMessageTimestamp(latestMessage.created_at);
              }
              
              messageCountRef.current = previousCount + newMessages.length;
            }
          }
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
      }
      
      // Schedule next poll if still in fallback mode
      if (mountedRef.current && isUsingFallback) {
        pollingTimeoutRef.current = setTimeout(pollForMessages, pollingInterval);
      }
    };
    
    // Start initial poll
    pollForMessages();
  }, [
    chatId, 
    userType, 
    isPolling, 
    lastMessageTimestamp, 
    pollingInterval, 
    isUsingFallback,
    normalizeMessage,
    onNewMessage
  ]);
  
  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Handle polling based on connection status
  useEffect(() => {
    if (isUsingFallback && chatId) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [isUsingFallback, chatId, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (enableWebSocket) {
      reconnectWebSocket();
    }
    
    // Also immediately poll for new messages
    const token = getAuthToken();
    if (token && chatId) {
      chatService.getMessages(token, chatId, userType)
        .then(messages => {
          if (Array.isArray(messages) && messages.length > 0) {
            // Find the latest message
            const latestMessage = messages.sort((a, b) => {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            })[0];
            
            if (latestMessage?.created_at) {
              setLastMessageTimestamp(latestMessage.created_at);
            }
            
            // Process all messages
            messages.forEach(msg => {
              const normalizedMessage = normalizeMessage(msg);
              onNewMessage?.(normalizedMessage);
            });
          }
        })
        .catch(error => {
          console.error('Error fetching messages during reconnect:', error);
        });
    }
  }, [enableWebSocket, reconnectWebSocket, chatId, userType, normalizeMessage, onNewMessage]);

  return {
    sendMessage,
    markAsRead,
    sendTypingIndicator,
    connectionStatus,
    isUsingFallback,
    reconnect
  };
} 