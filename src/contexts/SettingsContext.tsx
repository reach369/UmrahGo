'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService, SiteSettings } from '@/services/settings.service';

interface SettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  refetchSettings: () => Promise<void>;
  getLogoUrl: (isDark?: boolean) => string;
  getFaviconUrl: () => string;
  getSocialLinks: () => any;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsService.getSettingsWithProxy();
      setSettings(data);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setError(err.message || 'Failed to load settings');
      
      // Set fallback settings even on error
      const fallbackSettings = await settingsService.getSettingsWithProxy();
      setSettings(fallbackSettings);
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = (isDark = false): string => {
    if (!settings) return isDark ? '/images/logo-dark.png' : '/images/logo.png';
    return settingsService.getLogoUrl(settings, isDark);
  };

  const getFaviconUrl = (): string => {
    if (!settings) return '/favicon.ico';
    return settingsService.getFaviconUrl(settings);
  };

  const getSocialLinks = () => {
    if (!settings) return {};
    return settingsService.getSocialMediaLinks(settings);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    refetchSettings: fetchSettings,
    getLogoUrl,
    getFaviconUrl,
    getSocialLinks,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export default SettingsContext; 