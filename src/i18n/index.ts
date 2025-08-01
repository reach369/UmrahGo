// Import the message files
import arMessages from '../../messages/ar.json';
import enMessages from '../../messages/en.json';

// Define the available messages
const messages: Record<string, any> = {
  ar: arMessages,
  en: enMessages
};

/**
 * Get the messages for a specific locale
 * @param locale The locale to get messages for
 * @returns The messages for the locale
 */
export function getMessages(locale: string) {
  // Default to English if locale doesn't exist
  return messages[locale] || messages.en;
}

// Export other i18n utilities
export * from './routing';
export * from './navigation';
export * from './request'; 