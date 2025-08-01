'use client';

import { SessionProvider } from 'next-auth/react';
import FirebaseAuthCheck from './FirebaseAuthCheck';

/**
 * Client component wrapper for Firebase Auth
 * This wrapper provides the SessionProvider context required by FirebaseAuthCheck
 */
export default function FirebaseAuthWrapper() {
  return (
    <SessionProvider>
      <FirebaseAuthCheck />
    </SessionProvider>
  );
} 