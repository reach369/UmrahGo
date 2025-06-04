import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

// كائن يحتوي على ترجمات جميع اللغات
const messages: Record<string, any> = {
  ar: require('../../messages/ar.json'),
  en: require('../../messages/en.json')
};
 
export default getRequestConfig(async ({requestLocale}) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  
  return {
    locale,
    messages: messages[locale] || {}
  };
});