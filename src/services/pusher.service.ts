import Pusher from 'pusher-js';
import { PUSHER_CONFIG } from '@/config/pusher.config';
import { getAuthToken } from '@/lib/auth.service';
// Initialize Pusher with logging only in development
if (process.env.NODE_ENV !== 'production') {
  Pusher.log = (msg: string) => {
    console.log(msg);
  };
}

class PusherService {
  private static instance: PusherService;
  private pusher: Pusher | null = null;
  private channels: Map<string, any> = new Map();
  private connectionStatus: string = PUSHER_CONFIG.CONNECTION_STATUS.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isReconnecting: boolean = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): PusherService {
    if (!PusherService.instance) {
      PusherService.instance = new PusherService();
    }
    return PusherService.instance;
  }

  /**
   * Initialize the Pusher connection with enhanced error handling and retry
   */
  public initialize(): void {
    try {
      if (this.pusher) {
        this.disconnect();
      }

      // Reset reconnect attempts when manually initializing
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      
      const token = getAuthToken();
      
      this.connectionStatus = PUSHER_CONFIG.CONNECTION_STATUS.CONNECTING;
      console.log('Connecting to real-time service');
      
      // Initialize Pusher with auth headers and additional options for reliability
      this.pusher = new Pusher(PUSHER_CONFIG.APP_KEY, {
        cluster: PUSHER_CONFIG.APP_CLUSTER,
        ...PUSHER_CONFIG.OPTIONS,
        enabledTransports: ['ws', 'wss'], // Prioritize WebSocket but allow fallbacks
        disableStats: true,
        // pongTimeout: 30000, // Wait longer for pong responses (default 5000)
        // unavailableTimeout: 30000, // Wait longer before giving up (default 10000)
        // activityTimeout: 120000, // Longer activity timeout (default 30000)
        auth: token ? {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          }
        } : undefined
      });

      // Set up connection event handlers
      this.pusher.connection.bind('connecting', () => {
        this.connectionStatus = PUSHER_CONFIG.CONNECTION_STATUS.CONNECTING;
      });

      this.pusher.connection.bind('connected', () => {
        console.log('Connected to Pusher');
        this.connectionStatus = PUSHER_CONFIG.CONNECTION_STATUS.CONNECTED;
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        
        // Clear any existing reconnect timeout
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
        
        // Set up ping interval to keep connection alive
        this.setupPingInterval();
      });

      this.pusher.connection.bind('disconnected', () => {
        console.log('Disconnected from Pusher');
        this.connectionStatus = PUSHER_CONFIG.CONNECTION_STATUS.DISCONNECTED;
        
        // Clear ping interval
        this.clearPingInterval();
        
        // Only attempt to reconnect if not already reconnecting
        if (!this.isReconnecting) {
          this.attemptReconnect();
        }
      });

      this.pusher.connection.bind('error', (err: any) => {
        console.error('Pusher connection error:', err);
        this.connectionStatus = PUSHER_CONFIG.CONNECTION_STATUS.ERROR;
        
        // Attempt to reconnect after an error
        if (!this.isReconnecting) {
          this.attemptReconnect();
        }
      });
      
      // Handle failed connection attempts
      this.pusher.connection.bind('failed', () => {
        this.connectionStatus = PUSHER_CONFIG.CONNECTION_STATUS.ERROR;
        
        // Attempt to reconnect
        if (!this.isReconnecting) {
          this.attemptReconnect();
        }
      });
      
      // Handle unexpected disconnections
      this.pusher.connection.bind('unavailable', () => {
        this.connectionStatus = PUSHER_CONFIG.CONNECTION_STATUS.RECONNECTING;
        
        // Attempt to reconnect
        if (!this.isReconnecting) {
          this.attemptReconnect();
        }
      });
      
      // Add state_change handler for debugging
      this.pusher.connection.bind('state_change', (states: any) => {
        const { previous, current } = states;
        if (previous === 'connected' && current !== 'connected') {
          // Lost connection, may need to reconnect
          if (!this.isReconnecting) {
            this.attemptReconnect();
          }
        }
      });
    } catch (error) {
      console.error('Error initializing Pusher:', error);
      this.connectionStatus = PUSHER_CONFIG.CONNECTION_STATUS.ERROR;
      
      // Attempt to reconnect after error in initialization
      if (!this.isReconnecting) {
        this.attemptReconnect();
      }
    }
  }

  /**
   * Subscribe to a private channel
   */
  public subscribeToPrivateChannel(channelName: string): any {
    if (!this.pusher) {
      this.initialize();
    }
    
    if (!this.pusher) {
      return null;
    }
    
    // Add private- prefix if not present
    const fullChannelName = channelName.startsWith(PUSHER_CONFIG.CHANNELS.PRIVATE) 
      ? channelName 
      : `${PUSHER_CONFIG.CHANNELS.PRIVATE}${channelName}`;
    
    // Return existing channel if already subscribed
    if (this.channels.has(fullChannelName)) {
      return this.channels.get(fullChannelName);
    }
    
    try {
      // Subscribe to channel
      const channel = this.pusher.subscribe(fullChannelName);
      
      // Add error handler for subscription
      channel.bind('pusher:subscription_error', (error: any) => {
        console.error(`Error subscribing to channel ${fullChannelName}:`, error);
      });
      
      this.channels.set(fullChannelName, channel);
      return channel;
    } catch (error) {
      console.error(`Error subscribing to ${fullChannelName}:`, error);
      return null;
    }
  }

  /**
   * Subscribe to a presence channel
   */
  public subscribeToPresenceChannel(channelName: string): any {
    if (!this.pusher) {
      this.initialize();
    }
    
    if (!this.pusher) {
      return null;
    }
    
    // Add presence- prefix if not present
    const fullChannelName = channelName.startsWith(PUSHER_CONFIG.CHANNELS.PRESENCE) 
      ? channelName 
      : `${PUSHER_CONFIG.CHANNELS.PRESENCE}${channelName}`;
    
    // Return existing channel if already subscribed
    if (this.channels.has(fullChannelName)) {
      return this.channels.get(fullChannelName);
    }
    
    try {
      // Subscribe to channel
      const channel = this.pusher.subscribe(fullChannelName);
      
      // Add error handler for subscription
      channel.bind('pusher:subscription_error', (error: any) => {
        console.error(`Error subscribing to presence channel ${fullChannelName}:`, error);
      });
      
      this.channels.set(fullChannelName, channel);
      return channel;
    } catch (error) {
      console.error(`Error subscribing to ${fullChannelName}:`, error);
      return null;
    }
  }

  /**
   * Unsubscribe from a channel
   */
  public unsubscribe(channelName: string): void {
    if (!this.pusher) {
      return;
    }
    
    // Handle both with and without prefix
    const possibleNames = [
      channelName,
      `${PUSHER_CONFIG.CHANNELS.PRIVATE}${channelName}`,
      `${PUSHER_CONFIG.CHANNELS.PRESENCE}${channelName}`
    ];
    
    possibleNames.forEach(name => {
      if (this.channels.has(name)) {
        this.pusher?.unsubscribe(name);
        this.channels.delete(name);
      }
    });
  }

  /**
   * Disconnect from Pusher
   */
  public disconnect(): void {
    if (!this.pusher) {
      return;
    }
    
    // Clear all intervals and timeouts
    this.clearPingInterval();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Disconnect and clean up
    this.pusher.disconnect();
    this.channels.clear();
    this.pusher = null;
    this.connectionStatus = PUSHER_CONFIG.CONNECTION_STATUS.DISCONNECTED;
    this.isReconnecting = false;
  }

  /**
   * Get the current connection status
   */
  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  /**
   * Set up ping interval to keep connection alive
   */
  private setupPingInterval(): void {
    // Clear existing interval if any
    this.clearPingInterval();
    
    // Set up new interval
    this.pingInterval = setInterval(() => {
      // Only send ping if connected
      if (this.connectionStatus === PUSHER_CONFIG.CONNECTION_STATUS.CONNECTED && this.pusher) {
        // Check if connection is actually healthy
        if (this.pusher.connection.state !== 'connected') {
          // Connection state mismatch - trigger reconnect
          this.attemptReconnect();
          return;
        }
        
        // Send a client event to keep the connection alive
        try {
          // Just trigger the ping method to keep connection alive
          // this.pusher.connection.ping();
        } catch (e) {
          // Silent fail - this is just a keepalive
        }
      }
    }, PUSHER_CONFIG.PING_INTERVAL);
  }

  /**
   * Clear ping interval
   */
  private clearPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    // Prevent multiple reconnection attempts
    if (this.isReconnecting) {
      return;
    }
    
    this.isReconnecting = true;
    
    // Clear existing timeout if any
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    // Check if max attempts reached
    if (this.reconnectAttempts >= PUSHER_CONFIG.RECONNECTION.MAX_ATTEMPTS) {
      this.connectionStatus = PUSHER_CONFIG.CONNECTION_STATUS.ERROR;
      this.isReconnecting = false;
      return;
    }
    
    // Set reconnecting status
    this.connectionStatus = PUSHER_CONFIG.CONNECTION_STATUS.RECONNECTING;
    
    // Calculate delay for exponential backoff
    const delay = PUSHER_CONFIG.RECONNECTION.INTERVAL * Math.pow(2, this.reconnectAttempts);
    
    // Increment attempts counter
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${PUSHER_CONFIG.RECONNECTION.MAX_ATTEMPTS})...`);
    
    // Set timeout for reconnection
    this.reconnectTimeout = setTimeout(() => {
      this.initialize();
    }, delay);
  }
}

// Export singleton instance
export default PusherService.getInstance(); 