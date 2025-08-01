/**
 * Pusher Configuration
 * This file contains all configuration for Pusher WebSocket service
 */
export const ADMIN_WEB_URL = process.env.NEXT_PUBLIC_ADMIN_WEB_URL || 'http://localhost:8000';

export const PUSHER_CONFIG = {
  // Pusher app credentials from environment variables
  APP_ID: process.env.NEXT_PUBLIC_PUSHER_APP_ID || '1982850',
  APP_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY || 'a070cddb1e5b3a219393',
  APP_SECRET: process.env.NEXT_PUBLIC_PUSHER_SECRET || '7d247b79aeaed86a3b35',
  APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  
  // Connection options
  OPTIONS: {
    encrypted: true,
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/broadcasting/auth`,
    wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || 'realtime.lastumrahgo.com',
    wsPort: process.env.NEXT_PUBLIC_PUSHER_PORT ? parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT) : 6001,
    wssPort: process.env.NEXT_PUBLIC_PUSHER_PORT ? parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT) : 6001,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
  },
  
  // Channel types
  CHANNELS: {
    PRIVATE: 'private-',
    PRESENCE: 'presence-',
  },
  
  // Event names
  EVENTS: {
    NEW_MESSAGE: 'new-message',
    MESSAGE_READ: 'message-read',
    MESSAGE_DELIVERED: 'message-delivered',
    USER_TYPING: 'user-typing',
    USER_ONLINE: 'user-online',
    USER_OFFLINE: 'user-offline',
  },
  
  // Connection status
  CONNECTION_STATUS: {
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    RECONNECTING: 'reconnecting',
    ERROR: 'error',
  },
  
  // Reconnection settings
  RECONNECTION: {
    MAX_ATTEMPTS: 5,
    INTERVAL: 5000, // 5 seconds
  },
  
  // Ping interval to keep connection alive
  PING_INTERVAL: 30000, // 30 seconds
};

export default PUSHER_CONFIG; 