'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import NotificationProvider from '@/providers/NotificationProvider';
import NotificationBanner from '@/components/NotificationBanner';
import { ThemeProvider } from '@/components/theme-provider';
import { useEffect, useState } from 'react';

interface ClientRootLayoutProps {
  children: React.ReactNode;
}

export default function ClientRootLayout({ children }: ClientRootLayoutProps) {
  // This ensures consistent rendering between server and client
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Add meta theme-color if it doesn't exist
    if (!document.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#FFFFFF'; // Default light theme color
      document.head.appendChild(meta);
    }
    
    // Fix for Safari: ensures theme is properly applied
    const savedTheme = localStorage.getItem('umrahgo-theme');
    if (savedTheme) {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = savedTheme === 'dark' || (savedTheme === 'system' && systemDark);
      
      if (isDark && !document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
      } else if (!isDark && document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="umrahgo-theme"
      themes={['light', 'dark', 'system']}
    >
      <SessionProvider>
        <AuthProvider>
          <SettingsProvider>
            <NotificationProvider>
              <NotificationBanner />
              {children}
            </NotificationProvider>
          </SettingsProvider>
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  );
} 