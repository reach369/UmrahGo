/**
 * Advanced Translation Script
 * 
 * This script demonstrates how to integrate with translation APIs
 * to automatically generate translations for your application.
 * 
 * To use this script with the Google Translate API:
 * 1. Set up a Google Cloud project
 * 2. Enable the Cloud Translation API
 * 3. Create API credentials
 * 4. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 
 * Usage: 
 * - Install dependencies: npm install @google-cloud/translate
 * - Run: node scripts/translate-with-api.js
 */

const fs = require('fs');
const path = require('path');

// Uncomment this to use the Google Translate API
// const {Translate} = require('@google-cloud/translate').v2;
// const translate = new Translate();

// Base paths
const MESSAGES_DIR = path.join(__dirname, '..', 'messages');
const SOURCE_LOCALE = 'en';

// Available locales and their Google Translate codes
const LOCALES = [
  { code: 'en', googleCode: 'en' },
  { code: 'ar', googleCode: 'ar' }
];

// Ensure messages directory exists
if (!fs.existsSync(MESSAGES_DIR)) {
  fs.mkdirSync(MESSAGES_DIR, { recursive: true });
  console.log(`Created messages directory at ${MESSAGES_DIR}`);
}

// Read source translation file
const sourceFilePath = path.join(MESSAGES_DIR, `${SOURCE_LOCALE}.json`);
if (!fs.existsSync(sourceFilePath)) {
  console.error(`Source translation file not found: ${sourceFilePath}`);
  process.exit(1);
}

const sourceTranslations = JSON.parse(fs.readFileSync(sourceFilePath, 'utf8'));

// Function to translate text using Google Translate API
async function translateText(text, targetLanguage) {
  // In demo mode, we're just adding a prefix to show it would be translated
  console.log(`Demo mode: Would translate "${text}" to ${targetLanguage}`);
  return `[${targetLanguage}] ${text}`;
  
  // Uncomment this to use the real Google Translate API
  /*
  try {
    const [translation] = await translate.translate(text, targetLanguage);
    return translation;
  } catch (error) {
    console.error(`Error translating text: ${error.message}`);
    return text; // Return original text on error
  }
  */
}

// Function to recursively translate an object's string values
async function translateObject(obj, targetLanguage, currentPath = '') {
  const result = {};
  
  for (const key in obj) {
    const currentKey = currentPath ? `${currentPath}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = await translateObject(obj[key], targetLanguage, currentKey);
    } else if (typeof obj[key] === 'string') {
      if (process.stdout.isTTY) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Translating: ${currentKey}`);
      }
      result[key] = await translateText(obj[key], targetLanguage);
    } else {
      result[key] = obj[key];
    }
  }
  
  return result;
}

// Function to process a single locale
async function processLocale(locale) {
  console.log(`\nProcessing ${locale.code}:`);
  
  const targetFilePath = path.join(MESSAGES_DIR, `${locale.code}.json`);
  let existingTranslations = {};
  let needsTranslation = true;
  
  // Check if translation file already exists
  if (fs.existsSync(targetFilePath)) {
    console.log(`- Translation file exists, updating with new keys only`);
    existingTranslations = JSON.parse(fs.readFileSync(targetFilePath, 'utf8'));
    needsTranslation = false;
  } else {
    console.log(`- Creating new translation file`);
  }
  
  // Only translate source locale to target locale if it's not the source
  if (locale.code === SOURCE_LOCALE) {
    console.log(`- Skipping translation for source locale`);
    fs.writeFileSync(targetFilePath, JSON.stringify(sourceTranslations, null, 2), 'utf8');
    return;
  }
  
  // Recursive function to merge and identify new keys
  async function mergeAndTranslate(source, target = {}, path = '') {
    const result = {...target};
    
    for (const key in source) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key] || typeof target[key] !== 'object') {
          console.log(`- Adding missing section: ${currentPath}`);
          result[key] = await translateObject(source[key], locale.googleCode, currentPath);
        } else {
          result[key] = await mergeAndTranslate(source[key], target[key], currentPath);
        }
      } else if (!target.hasOwnProperty(key)) {
        console.log(`- Translating new key: ${currentPath}`);
        result[key] = await translateText(source[key], locale.googleCode);
      } else {
        result[key] = target[key];
      }
    }
    
    return result;
  }
  
  let finalTranslations;
  
  if (needsTranslation) {
    console.log(`- Translating all content to ${locale.code}`);
    finalTranslations = await translateObject(sourceTranslations, locale.googleCode);
  } else {
    finalTranslations = await mergeAndTranslate(sourceTranslations, existingTranslations);
  }
  
  // Write the final translations to file
  fs.writeFileSync(targetFilePath, JSON.stringify(finalTranslations, null, 2), 'utf8');
  console.log(`✓ Completed translations for ${locale.code}`);
}

// Main function to process all locales
async function main() {
  console.log('=== Starting Advanced Translation Process ===');
  
  for (const locale of LOCALES) {
    await processLocale(locale);
  }
  
  console.log('\n=== Translation Process Complete ===');
  console.log('\nNote: This script ran in demo mode. To use with real translation APIs:');
  console.log('1. Install the Google Cloud Translation library: npm install @google-cloud/translate');
  console.log('2. Set up Google Cloud credentials');
  console.log('3. Uncomment the relevant sections in the script');
}

// Run the main function
main().catch(error => {
  console.error('Error in translation process:', error);
  process.exit(1);
}); 