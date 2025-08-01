/**
 * إعدادات Firebase الشاملة
 * Firebase Configuration with Auth, Firestore, and Cloud Messaging
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  User, 
  onAuthStateChanged, 
  browserSessionPersistence, 
  setPersistence,
  signOut
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';
import { 
  API_BASE_CONFIG, 
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  getCompleteHeaders
} from '@/config/api.config';

import axiosInstance from './axios';
// إعدادات Firebase من متغيرات البيئة
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyClc_44GqwHT3btV7n6CLVkivvMju4XnUI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "umrago-af2f8.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://umrahgo-3f7a1-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "umrago-af2f8",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "umrago-af2f8.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "407769262389",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:407769262389:web:8418b303ffc41ca180447c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-F5Y5N48G7L"
};

// VAPID Key للإشعارات
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BMiP0YzToyeULVwZSYyt58_THZnLMaj5cVev1DClzobd0_8WziJgTAUNTk1RumKIqJpPxaPZPNyomvbUxlTfLkc";

// Variables to hold Firebase services
let app: any;
let auth: any;
let firestore: any;
let storage: any;
let googleProvider: any;

// تهيئة Cloud Messaging (فقط في المتصفح)
let messaging: Messaging | null = null;
let fcmTokenPromise: Promise<string | null> | null = null;

// Track initialization state
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize Firebase services
 */
const initializeFirebase = async (): Promise<void> => {
  if (isInitialized) {
    return;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('Initializing Firebase...');
      
      // Initialize Firebase app if not already initialized
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        console.log('Firebase app initialized successfully');
      } else {
        app = getApp();
        console.log('Using existing Firebase app');
      }
      
      // Initialize services
      auth = getAuth(app);
      firestore = getFirestore(app);
      storage = getStorage(app);
      
      // Configure Google Provider
      googleProvider = new GoogleAuthProvider();
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Set auth persistence to session
      await setPersistence(auth, browserSessionPersistence);
      console.log('Firebase auth persistence set to browserSession');
      
      // Initialize messaging if supported
      await initializeMessaging();
      
      isInitialized = true;
      console.log('Firebase services initialized successfully');
      
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  })();

  return initializationPromise;
};

/**
 * Initialize Firebase Cloud Messaging
 */
const initializeMessaging = async (): Promise<void> => {
  try {
    const supported = await isSupported();
    if (supported && 'serviceWorker' in navigator) {
      messaging = getMessaging(app);
      console.log('Firebase Cloud Messaging initialized successfully');
    } else {
      console.log('Firebase Cloud Messaging not supported on this browser');
    }
  } catch (error) {
    console.warn('Error initializing Firebase messaging:', error);
  }
};

/**
 * Enhanced Google Sign-In with better error handling
 */
export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    // Ensure Firebase is initialized
    await initializeFirebase();
    
    if (!auth || !googleProvider) {
      throw new Error('Firebase auth is not properly initialized');
    }
    
    console.log('Starting Google sign-in process...');
    
    // Store the current URL to return to after auth
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_return_url', window.location.pathname + window.location.search);
    }
    
    let result;
    
    try {
      // Try popup flow first (better user experience)
      console.log('Attempting popup sign-in...');
      result = await signInWithPopup(auth, googleProvider);
      console.log('Popup sign-in successful');
    } catch (popupError: any) {
      console.warn('Popup sign-in failed:', popupError.code);
      
      // If popup is blocked or closed, try redirect method
      if (popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request') {
        
        console.log('Falling back to redirect sign-in...');
        
        // Check for existing redirect result first
        const redirectResult = await getRedirectResult(auth);
        
        if (redirectResult && redirectResult.user) {
          console.log('Found existing redirect result');
          result = redirectResult;
        } else {
          // Start new redirect flow
          console.log('Starting redirect sign-in...');
          await signInWithRedirect(auth, googleProvider);
          // This will redirect the page, so we don't continue execution
          return null;
        }
      } else {
        // Re-throw other errors
        throw popupError;
      }
    }
    
    if (!result || !result.user) {
      throw new Error('Sign-in result is empty');
    }
    
    console.log('Firebase Google sign-in successful for user:', result.user.email);
    
    // Store user data in localStorage
    try {
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        phoneNumber: result.user.phoneNumber,
        emailVerified: result.user.emailVerified
      };
      localStorage.setItem('firebase_user', JSON.stringify(userData));
      console.log('Firebase user data stored successfully');
    } catch (storageError) {
      console.warn('Failed to store user data in localStorage:', storageError);
    }
    
    // Dispatch custom event for other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('firebaseUserLoggedIn', {
        detail: { user: result.user, method: 'google' }
      }));
    }
    
    return result.user;
    
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Enhance error messages
    if (error.code) {
      switch (error.code) {
        case 'auth/network-request-failed':
          error.message = 'Network connection failed. Please check your internet connection.';
          break;
        case 'auth/too-many-requests':
          error.message = 'Too many sign-in attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          error.message = 'This account has been disabled.';
          break;
        case 'auth/operation-not-allowed':
          error.message = 'Google sign-in is not enabled.';
          break;
      }
    }
    
    throw error;
  }
};

/**
 * Check for redirect result on page load
 */
export const checkRedirectResult = async (): Promise<User | null> => {
  try {
    await initializeFirebase();
    
    if (!auth) {
      return null;
    }
    
    const result = await getRedirectResult(auth);
    
    if (result && result.user) {
      console.log('Redirect sign-in successful for user:', result.user.email);
      
      // Dispatch custom event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('firebaseUserLoggedIn', {
          detail: { user: result.user, method: 'google-redirect' }
        }));
      }
      
      return result.user;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking redirect result:', error);
    return null;
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentUser = (): User | null => {
  if (!auth) {
    return null;
  }
  return auth.currentUser;
};

/**
 * Firebase logout
 */
export const firebaseLogout = async (): Promise<boolean> => {
  try {
    if (auth) {
      await signOut(auth);
      console.log('Firebase signed out successfully');
      
      // Clear stored data
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('firebase_user');
        localStorage.removeItem('firebase_token');
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Firebase logout error:', error);
    return false;
  }
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    await initializeFirebase();
    
    if (!messaging) {
      console.log('Firebase messaging not available');
      return null;
    }
    
    // Check if we already have a token request in progress
    if (fcmTokenPromise) {
      return fcmTokenPromise;
    }
    
    fcmTokenPromise = (async () => {
      try {
        console.log('Requesting notification permission...');
        
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('Notification permission granted');
          
          const token = await getToken(messaging!, { vapidKey: VAPID_KEY });
          
          if (token) {
            console.log('FCM token obtained:', token.substring(0, 20) + '...');
            return token;
          } else {
            console.log('No FCM registration token available');
            return null;
          }
        } else {
          console.log('Notification permission denied');
          return null;
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
      }
    })();
    
    return fcmTokenPromise;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

/**
 * Listen for messages when app is in foreground
 */
export const listenForMessages = (callback: (payload: any) => void): (() => void) | null => {
  try {
    if (!messaging) {
      console.log('Firebase messaging not available for listening');
      return null;
    }
    
    console.log('Starting to listen for FCM messages...');
    
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Received foreground message:', payload);
      callback(payload);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up message listener:', error);
    return null;
  }
};

// Initialize Firebase when in browser environment
if (typeof window !== 'undefined') {
  initializeFirebase()
    .then(() => {
      console.log('Firebase initialized on page load');
      
      // Check for redirect result on page load
      checkRedirectResult();
      
      // Make essential Firebase functions available globally
      window.firebase = {
        ...(window.firebase || {}),
        signInWithGoogle,
        checkRedirectResult,
        getCurrentUser,
        logout: firebaseLogout,
        requestNotificationPermission,
        listenForMessages
      };
    })
    .catch((error) => {
      console.error('Failed to initialize Firebase on page load:', error);
    });
}

// Export the configuration for external use
export { firebaseConfig, VAPID_KEY };
export default {
  signInWithGoogle,
  checkRedirectResult,
  getCurrentUser,
  firebaseLogout,
  requestNotificationPermission,
  listenForMessages
}; 