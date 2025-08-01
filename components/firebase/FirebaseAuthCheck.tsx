"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkRedirectResult, requestNotificationPermission, sendTokenToServer } from '@/lib/firebase';
import { signIn, useSession } from 'next-auth/react';

/**
 * Component to handle Firebase redirect authentication and FCM token management
 * Place this in your root layout or top-level component
 */
export default function FirebaseAuthCheck() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  
  // Safely access session - handle case where SessionProvider might not be available
  let sessionUpdate;
  try {
    const { update } = useSession();
    sessionUpdate = update;
  } catch (error) {
    console.warn('SessionProvider not available for FirebaseAuthCheck');
    sessionUpdate = async () => {}; // No-op function as fallback
  }
  
  // Handle Firebase redirect auth results
  useEffect(() => {
    // Only run this check once per page load
    if (isChecking) return;
    setIsChecking(true);

    const checkFirebaseRedirect = async () => {
      try {
        // Check if we have a Firebase redirect result
        const user = await checkRedirectResult();
        
        if (user) {
          console.log('Firebase redirect authentication successful');
          
          // Get FCM token
          const fcmToken = await requestNotificationPermission();
          
          if (fcmToken) {
            console.log('FCM token obtained after redirect auth');
            
            // Send FCM token to backend
            try {
              await sendTokenToServer(fcmToken, user.uid);
            } catch (tokenError) {
              console.warn('Failed to send FCM token to server:', tokenError);
              // Non-blocking error
            }
          }
          
          // Sign in with NextAuth to sync session
          try {
            const signInResult = await signIn('google', { 
              redirect: false,
              callbackUrl: localStorage.getItem('auth_return_url') || '/'
            });
            
            // Force update session if available
            if (sessionUpdate) {
              try {
                await sessionUpdate();
              } catch (error) {
                console.warn('Failed to update session:', error);
              }
            }
            
            // Store user info in localStorage for fallback
            localStorage.setItem('user', JSON.stringify({
              id: user.uid,
              name: user.displayName,
              email: user.email,
              profile_photo: user.photoURL,
            }));
            
            // Dispatch custom event for header update
            window.dispatchEvent(new Event('auth_state_changed'));
            
            // Redirect to the return URL if available
            const returnUrl = localStorage.getItem('auth_return_url');
            if (returnUrl) {
              localStorage.removeItem('auth_return_url');
              router.push(returnUrl);
            }
          } catch (nextAuthError) {
            console.error('Failed to sync with NextAuth:', nextAuthError);
          }
        }
      } catch (error) {
        console.error('Error checking Firebase redirect:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkFirebaseRedirect();
  }, [router, sessionUpdate]);
  
  // Listen for Firebase login events
  useEffect(() => {
    const handleFirebaseLogin = async (event: CustomEvent) => {
      const { user, method } = event.detail;
      
      if (user) {
        // Get FCM token
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          try {
            await sendTokenToServer(fcmToken, user.uid);
          } catch (error) {
            console.warn('Failed to send FCM token after login event:', error);
          }
        }
        
        // Force update NextAuth session if available
        if (sessionUpdate) {
          try {
            await sessionUpdate();
          } catch (error) {
            console.warn('Failed to update session after login event:', error);
          }
        }
        
        // Store user info in localStorage for fallback
        localStorage.setItem('user', JSON.stringify({
          id: user.uid,
          name: user.displayName,
          email: user.email,
          profile_photo: user.photoURL,
        }));
        
        // Dispatch custom event for header update
        window.dispatchEvent(new Event('auth_state_changed'));
      }
    };
    
    window.addEventListener('firebaseUserLoggedIn', handleFirebaseLogin as EventListener);
    
    return () => {
      window.removeEventListener('firebaseUserLoggedIn', handleFirebaseLogin as EventListener);
    };
  }, [sessionUpdate]);

  // This component doesn't render anything
  return null;
} 