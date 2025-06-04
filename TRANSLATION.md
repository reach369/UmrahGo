# UmrahGo Translation System

This document explains how to work with translations in the UmrahGo application.

## Overview

UmrahGo uses [next-intl](https://next-intl-docs.vercel.app/) for internationalization (i18n). Translations are stored in JSON files in the `messages/` directory.

Currently supported languages:
- English (en)
- Arabic (ar)

## Translation Files

Translation files are organized as JSON objects with nested keys. The structure follows the application's feature areas:

```
messages/
  en.json   # English (source language)
  ar.json   # Arabic
  # (other languages)
```

## Adding New Translations

When adding new text to the application:

1. Add the new string to the English translation file (`messages/en.json`) first
2. Run the translation generator to update other language files

## Translation Automation

We have two scripts for managing translations:

### 1. Basic Translation Generator

This script ensures all translation files have the same keys structure. It copies missing keys from the source language (English) to other language files.

```bash
npm run generate-translations
```

### 2. Advanced Translation with API

This script demonstrates integration with the Google Translate API for automatic translation of new strings. In the demo mode, it doesn't actually translate but shows how it would work.

```bash
npm run translate-with-api
```

To enable actual automatic translation:

1. Install the Google Cloud Translation library:
   ```bash
   npm install @google-cloud/translate
   ```

2. Set up Google Cloud credentials and enable the Translation API in your Google Cloud project

3. Edit `scripts/translate-with-api.js` to uncomment the relevant sections

## Adding a New Language

To add support for a new language:

1. Create a new translation file in `messages/` (e.g., `fr.json` for French)
2. Add the language code to the `LOCALES` array in both translation scripts
3. Run the translation generator to populate the new file with keys

## Usage in Components

In your React components, use the `useTranslations` hook from next-intl:

```jsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('app.name')}</h1>
      <p>{t('app.description')}</p>
    </div>
  );
}
```

## Translation Best Practices

1. Use meaningful, hierarchical keys that reflect the component/feature structure
2. Avoid hardcoding text in components
3. Keep translations simple and avoid complex logic in translation strings
4. Run the translation generator after adding new strings
5. Periodically review translations for quality and completeness 