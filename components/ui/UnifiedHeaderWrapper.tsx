'use client';

import { SettingsProvider } from '@/contexts/SettingsContext';
import { AuthProvider } from '@/contexts/AuthContext';
import UnifiedHeader from './unified-header';
import { ThemeProvider } from 'next-themes';

interface UnifiedHeaderWrapperProps {
  isDashboard?: boolean;
  showNotifications?: boolean;
}

/**
 * Client component wrapper for UnifiedHeader
 * This wrapper provides the required contexts for UnifiedHeader
 */
export default function UnifiedHeaderWrapper(props: UnifiedHeaderWrapperProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <SettingsProvider>
          <UnifiedHeader {...props} />
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 