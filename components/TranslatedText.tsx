'use client';

import { useTranslations } from 'next-intl';
import { Fragment, ReactNode } from 'react';

interface TranslatedTextProps {
  namespace?: string;
  id: string;
  params?: Record<string, string | number>;
  defaultMessage?: string;
  children?: ReactNode;
}

/**
 * A robust component for handling translations with fallbacks
 * Always use this when you need to translate text in a component
 */
export default function TranslatedText({ 
  namespace, 
  id, 
  params, 
  defaultMessage, 
  children 
}: TranslatedTextProps) {
  // Try to get translation from the specified namespace
  try {
    const t = namespace ? useTranslations(namespace) : useTranslations();
    return (
      <Fragment>
        {t(id, params ?? {})}
      </Fragment>
    );
  } catch (error) {
    // If the namespace or key doesn't exist, try alternate namespaces
    if (namespace !== 'nav') {
      try {
        const navT = useTranslations('nav');
        return (
          <Fragment>
            {navT(id, params ?? {})}
          </Fragment>
        );
      } catch (e) {
        // Continue to next fallback
      }
    }

    if (namespace !== 'Navigation') {
      try {
        const navT = useTranslations('Navigation');
        return (
          <Fragment>
            {navT(id, params ?? {})}
          </Fragment>
        );
      } catch (e) {
        // Continue to next fallback
      }
    }

    // Use the default message or children as fallback
    return (
      <Fragment>
        {defaultMessage || children || id}
      </Fragment>
    );
  }
} 