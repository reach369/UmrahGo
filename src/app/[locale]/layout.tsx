// This is a server component
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';

// Styles
import '../globals.css';
import '../../styles/fonts.css';
// Fonts
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Get the locale parameter synchronously - no need to await it
  const locale = params.locale;
  
  // Load messages asynchronously
  let messages;
  try {
    const result = await import(`../../../messages/${locale}.json`);
    messages = result.default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    notFound();
  }

  return (
    <div className={locale === 'ar' ? 'rtl' : 'ltr'} data-locale={locale}>
      <ThemeProvider>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </ThemeProvider>
    </div>
  );
}
