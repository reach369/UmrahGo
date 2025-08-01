import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, isValidLocale } from './config';

// Helper function to load translations
function getTranslations(locale: string) {
  try {
    // Load translations based on locale
    const messages = {
      ar: require('../../messages/ar.json'),
      en: require('../../messages/en.json')
    };
    
    return messages[locale as keyof typeof messages] || {};
  } catch (error) {
    console.error(`Error loading translations for ${locale}:`, error);
    return {};
  }
}

export default getRequestConfig(async ({requestLocale}) => {
  // Ensure requestLocale is a string
  const requested = (await requestLocale) || defaultLocale;
  
  // Validate locale and fallback to default if needed
  const locale = isValidLocale(requested) ? requested : defaultLocale;
  
  // تحميل الترجمات للغة المطلوبة
  const localeMessages = getTranslations(locale);
  
  return {
    locale,
    messages: localeMessages
  };
});