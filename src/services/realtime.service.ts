'use client';

import Pusher from 'pusher-js';
import axios from 'axios';
import { API_BASE_CONFIG } from '@/config/api.config';
import { toast } from 'sonner';

export interface RealtimeConfig {
  key?: string;
  cluster?: string;
  authEndpoint?: string;
  logToConsole?: boolean;
}

export class RealtimeService {
  private pusher: Pusher | null = null;
  private userId: number | null = null;
  private userType: string | null = null;
  private connected: boolean = false;
  private notificationHandlers: ((data: any) => void)[] = [];
  private messageHandlers: ((data: any) => void)[] = [];
  private statusHandlers: ((data: any) => void)[] = [];
  private config: RealtimeConfig;

  constructor(config: RealtimeConfig = {}) {
    this.config = {
      key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '12345',
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      authEndpoint: `${API_BASE_CONFIG.BASE_URL}/broadcasting/auth`,
      logToConsole: process.env.NODE_ENV === 'development',
      ...config
    };
  }

  async connect(userId: number | string, userType: string = 'user'): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      // Convert userId to number if it's a string
      this.userId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      this.userType = userType;
      
      // Get token for authentication
      const token = localStorage.getItem('nextauth_token') || localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return false;
      }
      
      // Initialize Pusher if not already done
      if (!this.pusher) {
        try {
          // Check if valid key and cluster are available
          if (!this.config.key || this.config.key === '12345' || !this.config.cluster) {
            console.warn('Pusher key or cluster not properly configured. Using mock mode for realtime service.');
            return false; // Return early without initializing Pusher
          }

          this.pusher = new Pusher(this.config.key, {
            cluster: this.config.cluster,
            authEndpoint: this.config.authEndpoint,
            auth: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            },
            enabledTransports: ['ws', 'wss'],
          });
        } catch (error) {
          console.error('Failed to initialize Pusher:', error);
          return false;
        }
        
        // Enable debug logs in development
        if (this.config.logToConsole) {
        //  Pusher.log= true;
        }
        
        // Set up connection event handlers
        this.pusher.connection.bind('connected', () => {
          console.log('Connected to Pusher');
          this.connected = true;
          this.updateUserStatus('online');
        });
        
        this.pusher.connection.bind('disconnected', () => {
          console.log('Disconnected from Pusher');
          this.connected = false;
        });
        
        this.pusher.connection.bind('error', (error: any) => {
          console.error('Pusher connection error:', error);
        });
        
        // Before window unload, update status to offline
        window.addEventListener('beforeunload', () => {
          this.updateUserStatus('offline');
        });
      }
      
      // Subscribe to user channel
      this.subscribeToUserChannel();
      
      // Subscribe to notification channel
      this.subscribeToNotificationChannel();
      
      return true;
    } catch (error) {
      console.error('Error connecting to realtime service:', error);
      return false;
    }
  }
  
  disconnect() {
    if (!this.pusher) return;
    
    try {
      // Update status to offline
      this.updateUserStatus('offline');
      
      // Unsubscribe from channels
      this.pusher.unsubscribe(`private-user.${this.userId}`);
      this.pusher.unsubscribe(`private-user.${this.userId}.notifications`);
      
      // Disconnect pusher
      this.pusher.disconnect();
      this.connected = false;
      this.pusher = null;
    } catch (error) {
      console.error('Error disconnecting from realtime service:', error);
    }
  }
  
  isConnected(): boolean {
    return this.connected;
  }
  
  // Subscribe to user's private channel
  private subscribeToUserChannel() {
    if (!this.pusher || !this.userId) return;
    
    try {
      const userChannel = this.pusher.subscribe(`private-user.${this.userId}`);
      
      userChannel.bind('message', (data: any) => {
        console.log('New private message received:', data);
        this.messageHandlers.forEach(handler => handler(data));
      });
      
      userChannel.bind('status.updated', (data: any) => {
        console.log('User status updated:', data);
        this.statusHandlers.forEach(handler => handler(data));
      });
    } catch (error) {
      console.error('Error subscribing to user channel:', error);
    }
  }
  
  // Subscribe to notification channel
  private subscribeToNotificationChannel() {
    if (!this.pusher || !this.userId) return;
    
    try {
      const notificationChannel = this.pusher.subscribe(`private-user.${this.userId}.notifications`);
      
      notificationChannel.bind('new-notification', (data: any) => {
        console.log('New notification received:', data);
        this.notificationHandlers.forEach(handler => handler(data.notification || data));
        
        // Show toast for high priority notifications if there are no handlers yet
        if (this.notificationHandlers.length === 0) {
          const notification = data.notification || data;
          if (notification.priority === 'high' || notification.priority === 'urgent') {
            toast(notification.title, {
              description: notification.message || notification.body || notification.content,
            });
          }
        }
      });
    } catch (error) {
      console.error('Error subscribing to notification channel:', error);
    }
  }
  
  // Update user online/offline status
  async updateUserStatus(status: 'online' | 'offline'): Promise<boolean> {
    if (!this.userId) return false;
    
    try {
      const token = localStorage.getItem('nextauth_token') || localStorage.getItem('token');
      if (!token) return false;
      
      const endpoint = status === 'online' 
        ? `${API_BASE_CONFIG.BASE_URL}/user/online` 
        : `${API_BASE_CONFIG.BASE_URL}/user/offline`;
      
      await axios.post(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Error updating user status to ${status}:`, error);
      return false;
    }
  }
  
  // Add notification listener
  onNotification(handler: (data: any) => void) {
    this.notificationHandlers.push(handler);
  }
  
  // Remove notification listener
  offNotification(handler: (data: any) => void) {
    this.notificationHandlers = this.notificationHandlers.filter(h => h !== handler);
  }
  
  // Add message listener
  onMessage(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }
  
  // Remove message listener
  offMessage(handler: (data: any) => void) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }
  
  // Add status listener
  onStatusUpdate(handler: (data: any) => void) {
    this.statusHandlers.push(handler);
  }
  
  // Remove status listener
  offStatusUpdate(handler: (data: any) => void) {
    this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
  }
}

// Export singleton instance by default
let realtimeServiceInstance: RealtimeService | null = null;

export const realtimeService = (): RealtimeService => {
  if (!realtimeServiceInstance) {
    realtimeServiceInstance = new RealtimeService();
  }
  
  return realtimeServiceInstance;
};

export default realtimeService; 