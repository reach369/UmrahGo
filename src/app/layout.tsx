// This is a server component
import { cn } from '@/lib/utils';

// Styles
import './globals.css';
import '../styles/fonts.css';
// Fonts
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className={cn(
        inter.variable,
        'min-h-screen bg-background font-sans antialiased'
      )}>
        {children}
      </body>
    </html>
  );
}

// This layout doesn't need any special styling or configuration
// It simply passes through to the locale-specific layouts
// The middleware handles the locale routing 