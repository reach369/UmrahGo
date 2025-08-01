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