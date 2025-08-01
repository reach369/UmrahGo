import { parsePhoneNumber, isValidPhoneNumber, CountryCode, formatNumber } from 'libphonenumber-js';
import { E164Number } from 'libphonenumber-js/core';

/**
 * Validates a phone number using libphonenumber-js
 * @param phoneNumber The phone number to validate
 * @param countryCode Optional country code for context-specific validation
 * @returns True if the phone number is valid, false otherwise
 */
export const validatePhoneNumber = (phoneNumber: string | undefined | null, countryCode?: CountryCode): boolean => {
  // Return false for null, undefined, or empty strings
  if (!phoneNumber || phoneNumber.trim() === '') return false;
  
  try {
    return isValidPhoneNumber(phoneNumber, countryCode);
  } catch (error) {
    console.warn('Phone validation error:', error);
    return false;
  }
};

/**
 * Formats a phone number according to international standards
 * @param phoneNumber The phone number to format
 * @param format The format to use (default: 'INTERNATIONAL')
 * @returns The formatted phone number
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  format: 'NATIONAL' | 'INTERNATIONAL' | 'E.164' | 'RFC3966' | 'IDD' = 'INTERNATIONAL'
): string => {
  if (!phoneNumber || phoneNumber.trim() === '') return phoneNumber;
  
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    if (!parsed) return phoneNumber;
    return parsed.format(format);
  } catch (error) {
    console.warn('Phone formatting error:', error);
    return phoneNumber;
  }
};

/**
 * Gets the country code from a phone number
 * @param phoneNumber The phone number
 * @returns The country code or undefined
 */
export const getCountryFromPhone = (phoneNumber: string): CountryCode | undefined => {
  if (!phoneNumber || phoneNumber.trim() === '') return undefined;
  
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    return parsed?.country;
  } catch (error) {
    console.warn('Country extraction error:', error);
    return undefined;
  }
};

/**
 * Normalizes a phone number to E.164 format
 * @param phoneNumber The phone number to normalize
 * @param defaultCountry Optional default country code
 * @returns The normalized phone number or undefined if invalid
 */
export const normalizePhoneNumber = (
  phoneNumber: string | undefined | null,
  defaultCountry?: CountryCode
): E164Number | undefined => {
  if (!phoneNumber || phoneNumber.trim() === '') return undefined;
  
  try {
    const parsed = parsePhoneNumber(phoneNumber, defaultCountry);
    if (!parsed || !parsed.isValid()) return undefined;
    return parsed.format('E.164') as E164Number;
  } catch (error) {
    console.warn('Phone normalization error:', error);
    return undefined;
  }
}; 