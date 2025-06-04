// Simple test script to check if we can load the translation files

const fs = require('fs');
const path = require('path');

function checkTranslationFile(locale) {
  console.log(`Checking ${locale} translation file...`);
  
  try {
    // Check if file exists using absolute path
    const absolutePath = path.resolve(`./messages/${locale}.json`);
    const exists = fs.existsSync(absolutePath);
    console.log(`File exists at ${absolutePath}: ${exists}`);
    
    if (exists) {
      // Try to load and parse the file
      const content = fs.readFileSync(absolutePath, 'utf8');
      const parsed = JSON.parse(content);
      
      console.log(`Successfully parsed ${locale}.json`);
      
      // Check if it has the required PilgrimUser namespace
      if (parsed.PilgrimUser) {
        console.log(`✅ PilgrimUser namespace exists in ${locale}.json`);
      } else {
        console.log(`❌ PilgrimUser namespace missing in ${locale}.json`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${locale}.json:`, error.message);
  }
}

// Check both translation files
checkTranslationFile('en');
checkTranslationFile('ar');

// Test the relative path that's used in the code
console.log('\nChecking relative paths that would be used in the app:');
['../messages', '../../messages', '../../../messages'].forEach(basePath => {
  ['en', 'ar'].forEach(locale => {
    const relativePath = `${basePath}/${locale}.json`;
    console.log(`Testing path: ${relativePath}`);
    
    try {
      // This is a simplistic test - in a real app, we'd use dynamic imports
      const resolvedPath = path.resolve(__dirname, relativePath);
      const exists = fs.existsSync(resolvedPath);
      console.log(`  Resolved to: ${resolvedPath}`);
      console.log(`  File exists: ${exists}`);
    } catch (error) {
      console.error(`  Error:`, error.message);
    }
  });
}); 