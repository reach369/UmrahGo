/**
 * Chat WebSocket Configuration
 * 
 * This file provides WebSocket functionality for real-time chat
 * based on the backend implementation as described in chat-system.md
 */
import { CHAT_CONFIG } from './chat.config';

/**
 * Echo Implementation
 * 
 * Simple implementation of the Laravel Echo interface for WebSockets
 * as described in the documentation
 */
export class ChatEcho {
  private config: any;
  private channels: Map<string, any> = new Map();
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private socket: WebSocket | null = null;
  
  constructor(config: any) {
    this.config = config;
    this.connect();
  }

  /**
   * Connect to the WebSocket server
   */
  private connect() {
    try {
      this.connectionStatus = 'connecting';
      
      const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsBaseUrl = this.config.wsUrl || CHAT_CONFIG.WS.getWSUrl();
      
      const wsUrl = `${wsBaseUrl}/ws/chat?token=${encodeURIComponent(this.config.auth.token)}`;
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        this.connectionStatus = 'connected';
        console.log('Echo: WebSocket connection established');
        
        // Subscribe to all channels
        this.channels.forEach((channel, channelName) => {
          this.subscribeToChannel(channelName, channel);
        });
      };
      
      this.socket.onclose = (event) => {
        this.connectionStatus = 'disconnected';
        console.log('Echo: WebSocket connection closed', event.code);
        
        // Attempt to reconnect unless it was a normal closure
        if (event.code !== 1000) {
          setTimeout(() => {
            this.connect();
          }, CHAT_CONFIG.WS.RECONNECT_INTERVAL);
        }
      };
      
      this.socket.onerror = (error) => {
        this.connectionStatus = 'error';
        console.error('Echo: WebSocket error:', error);
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle channel messages
          if (data.channel && data.event) {
            const channel = this.channels.get(data.channel);
            if (channel) {
              const eventHandler = channel.events.get(data.event);
              if (eventHandler) {
                eventHandler(data.data);
              }
            }
          }
          
          // Handle presence channel events
          if (data.event === 'presence') {
            const channel = this.channels.get(data.channel);
            if (channel && channel.type === 'presence') {
              if (data.action === 'here') {
                channel.hereCallback?.(data.users);
              } else if (data.action === 'joining') {
                channel.joiningCallback?.(data.user);
              } else if (data.action === 'leaving') {
                channel.leavingCallback?.(data.user);
              }
            }
          }
        } catch (error) {
          console.error('Echo: Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      this.connectionStatus = 'error';
      console.error('Echo: Error establishing WebSocket connection:', error);
    }
  }

  /**
   * Subscribe to a channel
   * @param channelName Name of the channel
   * @param channel Channel configuration
   */
  private subscribeToChannel(channelName: string, channel: any) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    // Send subscription request
    this.socket.send(JSON.stringify({
      type: 'subscribe',
      channel: channelName,
      channel_type: channel.type
    }));
  }

  /**
   * Join a presence channel
   * @param channelName Name of the channel
   * @returns Channel interface
   */
  join(channelName: string) {
    const channel = {
      type: 'presence',
      events: new Map(),
      hereCallback: null as ((users: any[]) => void) | null,
      joiningCallback: null as ((user: any) => void) | null,
      leavingCallback: null as ((user: any) => void) | null,
      
      here(callback: (users: any[]) => void) {
        channel.hereCallback = callback;
        return channel;
      },
      
      joining(callback: (user: any) => void) {
        channel.joiningCallback = callback;
        return channel;
      },
      
      leaving(callback: (user: any) => void) {
        channel.leavingCallback = callback;
        return channel;
      },
      
      listen(event: string, callback: (data: any) => void) {
        channel.events.set(event, callback);
        return channel;
      }
    };
    
    this.channels.set(channelName, channel);
    
    if (this.connectionStatus === 'connected' && this.socket?.readyState === WebSocket.OPEN) {
      this.subscribeToChannel(channelName, channel);
    }
    
    return channel;
  }

  /**
   * Subscribe to a private channel
   * @param channelName Name of the channel
   * @returns Channel interface
   */
  private(channelName: string) {
    const channel = {
      type: 'private',
      events: new Map(),
      
      listen(event: string, callback: (data: any) => void) {
        channel.events.set(event, callback);
        return channel;
      }
    };
    
    this.channels.set(channelName, channel);
    
    if (this.connectionStatus === 'connected' && this.socket?.readyState === WebSocket.OPEN) {
      this.subscribeToChannel(channelName, channel);
    }
    
    return channel;
  }

  /**
   * Subscribe to a public channel
   * @param channelName Name of the channel
   * @returns Channel interface
   */
  channel(channelName: string) {
    const channel = {
      type: 'public',
      events: new Map(),
      
      listen(event: string, callback: (data: any) => void) {
        channel.events.set(event, callback);
        return channel;
      }
    };
    
    this.channels.set(channelName, channel);
    
    if (this.connectionStatus === 'connected' && this.socket?.readyState === WebSocket.OPEN) {
      this.subscribeToChannel(channelName, channel);
    }
    
    return channel;
  }

  /**
   * Send a message through the WebSocket
   * @param type Type of message
   * @param data Message data
   * @returns Boolean indicating success
   */
  send(type: string, data: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    try {
      this.socket.send(JSON.stringify({
        type,
        ...data
      }));
      return true;
    } catch (error) {
      console.error('Echo: Error sending message:', error);
      return false;
    }
  }

  /**
   * Disconnect the WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connectionStatus = 'disconnected';
    }
  }

  /**
   * Get the current connection status
   * @returns Connection status
   */
  getConnectionStatus() {
    return this.connectionStatus;
  }
}

/**
 * Create an Echo instance
 * @param config Configuration
 * @returns Echo instance
 */
export const createEcho = (config: any) => {
  return new ChatEcho(config);
};

export default {
  createEcho
}; 