import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { getUnreadCount, markMessagesAsRead } from '../services/chatService';
import { getAuthToken } from '@/lib/auth.service';

type ChatMessage = {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  content_type: 'text' | 'image' | 'document' | 'voice' | 'location';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
};

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

type UsePilgrimChatWebSocketProps = {
  chatId?: string;
  onNewMessage?: (message: ChatMessage) => void;
  onMessageStatusUpdate?: (messageId: string, status: string) => void;
  onConnectionStatusChange?: (status: WebSocketStatus) => void;
};

const WS_RECONNECT_INTERVAL = 5000; // 5 seconds
const WS_PING_INTERVAL = 30000; // 30 seconds

export const usePilgrimChatWebSocket = ({
  chatId,
  onNewMessage,
  onMessageStatusUpdate,
  onConnectionStatusChange,
}: UsePilgrimChatWebSocketProps) => {
  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatus>('disconnected');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = useSession();

  // Get token from centralized auth service
  const getToken = useCallback(() => {
    return getAuthToken();
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (lastMessageId: string) => {
    try {
      const token = getToken();
      if (!token || !chatId) return;
      
      await markMessagesAsRead(token, chatId, lastMessageId);
      
      // Refresh unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [chatId, getToken]);

  // Fetch unread message count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      try {
        const count = await getUnreadCount(token);
        setUnreadCount(count);
      } catch (error) {
        // Since getUnreadCount now returns 0 instead of throwing, this catch block
        // should rarely be reached, but we keep it just in case
        console.warn('Error in pilgrim chat fetchUnreadCount, using previous value:', error);
      }
    } catch (error) {
      console.warn('Error in pilgrim chat unread count process:', error);
      // Don't update state or show errors to user for background operations
    }
  }, [getToken]);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    try {
      const token = getToken();
      
      if (!token) {
        console.error('No authentication token available');
        setConnectionStatus('error');
        return;
      }

      // Clean up existing connection if any
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }

      setConnectionStatus('connecting');
      
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 
        (process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1')
          .replace('https://', wsProtocol + '//')
          .replace('http://', wsProtocol + '//')
          .replace('/api/v1', '');
      
      const wsUrl = `${wsBaseUrl}/ws/chat?token=${encodeURIComponent(token)}${chatId ? `&chat_id=${chatId}` : ''}`;
      
      const ws = new WebSocket(wsUrl);
      webSocketRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        if (onConnectionStatusChange) onConnectionStatusChange('connected');
        
        // Set up ping interval to keep connection alive
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, WS_PING_INTERVAL);
        
        // Reset reconnect timeout if it exists
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        
        // Fetch initial unread count
        fetchUnreadCount();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'message') {
            // New message received
            if (onNewMessage && data.message) {
              onNewMessage(data.message);
            }
            
            // Update unread count
            fetchUnreadCount();
          } 
          else if (data.type === 'message_status') {
            // Message status update (delivered, read)
            if (onMessageStatusUpdate && data.message_id && data.status) {
              onMessageStatusUpdate(data.message_id, data.status);
            }
          }
          else if (data.type === 'pong') {
            // Pong response, connection is still alive
            console.debug('WebSocket connection is alive');
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        setConnectionStatus('disconnected');
        if (onConnectionStatusChange) onConnectionStatusChange('disconnected');
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Attempt to reconnect unless it was a normal closure
        if (event.code !== 1000) {
          setConnectionStatus('reconnecting');
          if (onConnectionStatusChange) onConnectionStatusChange('reconnecting');
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, WS_RECONNECT_INTERVAL);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        if (onConnectionStatusChange) onConnectionStatusChange('error');
      };
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      setConnectionStatus('error');
      if (onConnectionStatusChange) onConnectionStatusChange('error');
      
      // Try to reconnect
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, WS_RECONNECT_INTERVAL);
    }
  }, [chatId, getToken, onConnectionStatusChange, onNewMessage, onMessageStatusUpdate, fetchUnreadCount]);

  // Send a message through the WebSocket
  const sendMessage = useCallback((content: string, type: string = 'text') => {
    if (!webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN || !chatId) {
      toast.error('لا يمكن إرسال الرسالة، تأكد من اتصالك بالإنترنت');
      return false;
    }

    try {
      const message = {
        type: 'message',
        chat_id: chatId,
        content,
        content_type: type
      };

      webSocketRef.current.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('فشل إرسال الرسالة');
      return false;
    }
  }, [chatId]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    setConnectionStatus('disconnected');
  }, []);

  // Connect on mount, reconnect if token or chatId changes
  useEffect(() => {
    const token = getToken();
    if (token) {
      connectWebSocket();
    } else {
      setConnectionStatus('error');
      if (onConnectionStatusChange) onConnectionStatusChange('error');
    }

    return () => {
      disconnect();
    };
  }, [chatId, getToken, connectWebSocket, disconnect, onConnectionStatusChange]);

  return {
    connectionStatus,
    sendMessage,
    markAsRead,
    unreadCount,
    fetchUnreadCount,
    disconnect
  };
};

export default usePilgrimChatWebSocket; 