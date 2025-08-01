import { useTranslations } from 'next-intl';

/**
 * Format a price with the appropriate currency symbol based on locale
 * @param amount The price amount to format
 * @param locale The locale to use for formatting (defaults to browser locale)
 * @param currency The currency code (defaults to SAR)
 * @returns Formatted price string
 */
export function formatPrice(
  amount: number,
  locale?: string,
  currency: string = 'SAR'
): string {
  try {
    const browserLocale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    const formattedAmount = new Intl.NumberFormat(locale || browserLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    
    return formattedAmount;
  } catch (error) {
    // Fallback in case of any formatting errors
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/**
 * Format a price with the appropriate currency symbol using translations
 * @param amount The price amount to format
 * @param t Translation function
 * @returns Formatted price string with the currency from translations
 */
export function formatPriceWithTranslation(
  amount: number,
  t: ReturnType<typeof useTranslations>
): string {
  try {
    // Format number with proper separators but no currency symbol
    const formattedNumber = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    
    // Get currency symbol/text from translations
    const currency = t('common.currency');
    
    // Return formatted string based on current locale direction
    const isRTL = document.documentElement.dir === 'rtl';
    
    return isRTL
      ? `${formattedNumber} ${currency}`
      : `${currency} ${formattedNumber}`;
  } catch (error) {
    // Fallback
    return `${amount.toFixed(2)} SAR`;
  }
}