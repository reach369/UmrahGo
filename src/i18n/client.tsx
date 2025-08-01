'use client';

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';

// Define the i18n context type
interface I18nContextType {
  locale: string;
  messages: Record<string, any>;
  t: (key: string, params?: Record<string, any>) => string;
}

// Create the context
const I18nContext = createContext<I18nContextType | null>(null);

// Hook for using i18n
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Simple translation function
function translate(key: string, messages: Record<string, any>, params?: Record<string, any>): string {
  // Split the key by dots to access nested properties
  const keys = key.split('.');
  let message: any = messages;
  
  // Traverse the messages object
  for (const k of keys) {
    message = message?.[k];
    if (!message) break;
  }
  
  // If message not found, return the key
  if (!message || typeof message !== 'string') return key;
  
  // Replace parameters if they exist
  if (params) {
    return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
      return str.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
    }, message);
  }
  
  return message;
}

// Props type for I18nProviderClient
interface I18nProviderClientProps {
  locale: string;
  children: ReactNode;
}

// Client-side i18n provider
export function I18nProviderClient({ locale, children }: I18nProviderClientProps) {
  const [messages, setMessages] = useState<Record<string, any>>({});
  
  // Load messages for the current locale
  useEffect(() => {
    async function loadMessages() {
      try {
        // Try to load the messages for the current locale
        const localeMessages = await import(`/messages/${locale}.json`).catch(() => ({}));
        setMessages(localeMessages.default || localeMessages);
      } catch (error) {
        console.error(`Error loading messages for locale ${locale}:`, error);
        setMessages({});
      }
    }
    
    loadMessages();
  }, [locale]);
  
  // Translation function
  const t = (key: string, params?: Record<string, any>) => {
    return translate(key, messages, params);
  };
  
  return (
    <I18nContext.Provider value={{ locale, messages, t }}>
      {children}
    </I18nContext.Provider>
  );
} 