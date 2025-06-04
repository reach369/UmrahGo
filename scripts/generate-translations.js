const fs = require('fs');
const path = require('path');

// Base paths
const MESSAGES_DIR = path.join(__dirname, '..', 'messages');
const SOURCE_LOCALE = 'en';

// Available locales 
const LOCALES = ['en', 'ar'];

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

// Read source translation content
const sourceTranslations = JSON.parse(fs.readFileSync(sourceFilePath, 'utf8'));

// Function to check if translation file exists and create it if it doesn't
function ensureTranslationFile(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  
  if (fs.existsSync(filePath)) {
    console.log(`Translation file for ${locale} already exists.`);
    return true;
  }
  
  // For demonstration purposes, we're creating a copy of the source file
  // In a real scenario, you might want to use translation APIs here
  fs.writeFileSync(filePath, JSON.stringify(sourceTranslations, null, 2), 'utf8');
  console.log(`Created new translation file for ${locale}.`);
  return false;
}

// Function to update existing translation files with new keys from source
function updateTranslationFile(locale) {
  if (locale === SOURCE_LOCALE) return;
  
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Recursive function to merge new keys
  function mergeTranslations(source, target, path = '') {
    for (const key in source) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
          console.log(`Added missing section '${currentPath}' to ${locale} translations.`);
        }
        mergeTranslations(source[key], target[key], currentPath);
      } else if (!target.hasOwnProperty(key)) {
        target[key] = source[key];
        console.log(`Added missing key '${currentPath}' to ${locale} translations.`);
      }
    }
  }
  
  mergeTranslations(sourceTranslations, translations);
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
  console.log(`Updated translations for ${locale}.`);
}

// Process all locales
console.log('=== Starting Translation Generation ===');
for (const locale of LOCALES) {
  console.log(`\nProcessing ${locale}:`);
  const exists = ensureTranslationFile(locale);
  if (exists) {
    updateTranslationFile(locale);
  }
}
console.log('\n=== Translation Generation Complete ==='); 