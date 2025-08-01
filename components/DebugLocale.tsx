'use client';

import { useState, useEffect } from 'react';
import { getAuthToken } from '@/lib/auth.service';

/**
 * Debug component that displays useful information about the
 * application state for troubleshooting purposes.
 * 
 * This component should only be used during development.
 */
export default function DebugLocale() {
  const [locale, setLocale] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  // This will run only on the client side
  useEffect(() => {
    setIsClient(true);
    setLocale(document.documentElement.lang || 'No lang attribute found');
    
    // Get auth token
    const authToken = getAuthToken();
    setToken(authToken ? 'Available (masked)' : 'Not available');
    
    // Get user info
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserInfo({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.roles ? user.roles[0]?.name : 'No role'
        });
      }
    } catch (error) {
      console.error('Error parsing user info:', error);
    }
  }, []);

  if (!isClient) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-2 text-xs font-mono z-50 opacity-80">
      <div className="flex justify-between items-center">
        <div>
          <strong>Debug:</strong> {locale} | 
          <span className="mx-2">
            Token: <span className={token ? 'text-green-400' : 'text-red-400'}>{token}</span>
          </span>
          {userInfo && (
            <span className="mx-2">
              User: <span className="text-blue-400">{userInfo.name} ({userInfo.role})</span>
            </span>
          )}
        </div>
        <button 
          className="bg-red-600 hover:bg-red-700 rounded px-2 py-1 text-white"
          onClick={() => {
            try {
              localStorage.clear();
              sessionStorage.clear();
              document.cookie.split(';').forEach(c => {
                document.cookie = c
                  .replace(/^ +/, '')
                  .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
              });
              alert('Storage cleared! Reloading page...');
              window.location.reload();
            } catch (error) {
              console.error('Error clearing storage:', error);
              alert('Error clearing storage: ' + error);
            }
          }}
        >
          Clear Storage
        </button>
      </div>
    </div>
  );
} 