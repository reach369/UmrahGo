import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage, updateMessageStatus, addNotification } from '../redux/chatSlice';
import { TransportChatMessage, TransportChatNotification } from '../types/chat.types';

interface WebSocketMessage {
  type: 'new_message' | 'message_status' | 'notification';
  payload: any;
}

export const useTransportChatWebSocket = (userId: string) => {
  const dispatch = useDispatch();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/transport/chat?userId=${userId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);

        switch (data.type) {
          case 'new_message':
            const message: TransportChatMessage = data.payload;
            dispatch(addMessage(message));
            break;

          case 'message_status':
            const { messageId, chatId, status } = data.payload;
            dispatch(updateMessageStatus({ messageId, chatId, status }));
            break;

          case 'notification':
            const notification: TransportChatNotification = data.payload;
            dispatch(addNotification(notification));
            break;

          default:
            console.warn('Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          useTransportChatWebSocket(userId);
        }
      }, 5000);
    };

    // Cleanup on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [userId, dispatch]);

  // Function to send messages through WebSocket
  const sendWebSocketMessage = (type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  return { sendWebSocketMessage };
}; 