import { User } from 'firebase/auth';

declare global {
  interface Window {
    // Firebase authentication helper function
    signInWithGoogle: () => Promise<User | null>;
    // FCM messaging object 
    messaging?: any;
  }
}

export {}; 