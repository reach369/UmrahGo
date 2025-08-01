import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'UmrahGo - عمرة قو',
  description: 'منصة شاملة لحجز رحلات العمرة والحج',
  keywords: 'عمرة, حج, رحلات دينية, السعودية',
  authors: [{ name: 'UmrahGo Team' }],
  creator: 'UmrahGo',
  publisher: 'UmrahGo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'UmrahGo - منصة العمرة',
    description: 'منصة شاملة لحجز رحلات العمرة والحج',
    url: 'https://umrahgo.net',
    siteName: 'UmrahGo',
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UmrahGo - منصة العمرة',
    description: 'منصة شاملة لحجز رحلات العمرة والحج',
    creator: '@umrahgo',
  },
};

// Move viewport configuration from metadata to viewport export
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}; 