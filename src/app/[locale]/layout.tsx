// This is a server component
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';
import { Metadata } from 'next';

// Styles
import '../globals.css';
import '../../styles/fonts.css';

export const metadata: Metadata = {
  title: {
    default: 'UmrahGo - خدمات العمرة الميسرة',
    template: '%s | UmrahGo'
  },
  description: 'منصة UmrahGo توفر حلول العمرة المتكاملة بطريقة سهلة وميسرة',
};

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
    <html lang={locale} className={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <div data-locale={locale}>
          <ThemeProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              {children}
            </NextIntlClientProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
