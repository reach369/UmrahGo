// Import the translation messages
const translationMessages: Record<string, any> = {
  ar: require('../messages/ar.json'),
  en: require('../messages/en.json')
};

/**
 * Function to get messages for a specific locale
 * @param locale The locale code (ar, en)
 * @returns The messages for the locale
 */
export function getMessages(locale: string) {
  try {
    return translationMessages[locale] || {};
  } catch (error) {
    console.error(`Error loading messages for locale ${locale}:`, error);
    return {};
  }
}

/**
 * List of supported locales
 */
export const locales = ['ar', 'en'];

/**
 * Default locale
 */
export const defaultLocale = 'ar';

/**
 * Check if a locale is supported
 * @param locale The locale to check
 * @returns Whether the locale is supported
 */
export function isLocaleSupported(locale: string): boolean {
  return locales.includes(locale);
} 