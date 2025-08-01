// This is a server component
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import LocaleManager from './locale-manager';
import { routing } from '@/i18n/routing';

import { createTranslator } from 'next-intl';
import FirebaseAuthWrapper from '@/components/firebase/FirebaseAuthWrapper';
import { PersistentSessionProvider } from '@/providers/SessionProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/providers/NotificationProvider';

// Add import for ChatNotificationDropdown
import ChatNotificationDropdown from '@/components/notifications/ChatNotificationDropdown';

interface Props {
  children: ReactNode;
  params: { locale: string };
}

// Define supported locales
const locales = routing.locales;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  // Access locale directly from params
  const locale = (await params).locale;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  // Load all messages for the current locale
  let messages;
  
  try {
    messages = await getMessages({ locale });
    
    // Pre-validate that we can create a translator
    createTranslator({ locale, messages });
  } catch (error) {
    console.error(`Error loading messages for locale ${locale}:`, error);
    // Fallback to empty messages object to prevent crashes
    messages = {};
  }

  return (
    <NextIntlClientProvider 
      locale={locale} 
      messages={messages}
      // Do NOT use onError handler here as it causes Client Component props error
      // Handle errors using TranslatedText component instead
    >
      <PersistentSessionProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className={`locale-container ${locale === 'ar' ? 'rtl' : 'ltr'}`} data-locale={locale}>
              <LocaleManager locale={locale} />
              {/* Use client component wrapper for Firebase Auth */}
              {/* <FirebaseAuthWrapper /> */}
              {children}
            </div>
          </NotificationProvider>
        </AuthProvider>
      </PersistentSessionProvider>
    </NextIntlClientProvider>
  );
}
