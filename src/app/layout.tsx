import { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import ClientRootLayout from './client-layout';

// Styles
import './globals.css';
import '../styles/fonts.css';
import '../styles/responsive.css';

export const metadata: Metadata = {
  title: 'نظام العمرة المتكامل',
  description: 'نظام إدارة رحلات العمرة والحج',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        
        <ClientRootLayout>
          {children}
        </ClientRootLayout>
        <Toaster />
      </body>
    </html>
  );
}