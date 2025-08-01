/**
 * Chat System Initialization
 * Helper functions to initialize the chat system with direct Pusher
 */

import { realtimeService } from '@/services/realtime.service';

/**
 * Initializes the chat system for the current user
 * @param userId The ID of the current user
 * @param userType The type of the current user (admin, office, customer, etc.)
 * @returns Promise<boolean> True if initialization was successful
 */
export async function initializeChatSystem(
  userId: number,
  userType: string = 'pilgrim'
): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  try {
    console.log('Initializing chat system for user:', userId, 'type:', userType);
    
    // Initialize the realtime service
    const service = realtimeService();
    
    // Connect to Pusher and set up channels
    const connected = await service.connect(userId, userType);
    
    if (!connected) {
      console.error('Failed to connect to Pusher');
      
      // Retry once after a delay
      return new Promise((resolve) => {
        setTimeout(async () => {
          console.log('Retrying chat system initialization...');
          try {
            const retryResult = await service.connect(userId, userType);
            resolve(!!retryResult);
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            resolve(false);
          }
        }, 2000);
      });
    }
    
    // Successfully connected
    console.log('Chat system initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing chat system:', error);
    return false;
  }
}

/**
 * Disconnects the chat system
 */
export function disconnectChatSystem(): void {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('Disconnecting chat system...');
    const service = realtimeService();
    
    // Disconnect from Pusher
    service.disconnect();
    
    console.log('Chat system disconnected');
  } catch (error) {
    console.error('Error disconnecting chat system:', error);
  }
}

/**
 * Reconnects the chat system
 * @param userId The ID of the current user
 * @param userType The type of the current user (admin, office, customer, etc.)
 */
export async function reconnectChatSystem(
  userId: number,
  userType: string = 'pilgrim'
): Promise<boolean> {
  try {
    console.log('Reconnecting chat system...');
    
    // First disconnect
    disconnectChatSystem();
    
    // Wait a bit before reconnecting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reinitialize
    return await initializeChatSystem(userId, userType);
  } catch (error) {
    console.error('Error reconnecting chat system:', error);
    return false;
  }
}

/**
 * Helper function to check if the chat system is connected
 * @returns boolean True if connected
 */
export function isChatSystemConnected(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const service = realtimeService();
    return service.isConnected();
  } catch (error) {
    console.error('Error checking if chat system is connected:', error);
    return false;
  }
} 