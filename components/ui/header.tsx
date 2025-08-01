'use client';

import { Link } from '@/i18n/navigation';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useSettings } from '@/contexts/SettingsContext';
import { Skeleton } from '@/components/ui/skeleton';

export function Header() {
  const params = useParams();
  const pathname = usePathname();
  const locale = params?.locale as string || 'ar';
  const t = useTranslations();
  const isRtl = locale === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Use settings from context
  const { settings, loading, getLogoUrl } = useSettings();

  const navigationItems = [
    { name: t('nav.home') || 'الرئيسية', href: '/' },
    { name: t('nav.packages') || 'الباقات', href: '/packages' },
    { name: t('nav.offices') || 'مكاتب العمرة', href: '/umrah-offices' },
    { name: t('nav.howItWorks') || 'كيف نعمل', href: '/how-it-works' },
    { name: t('nav.aboutUs') || 'من نحن', href: '/about-us' },
    { name: t('nav.contact') || 'اتصل بنا', href: '/contact' },
  ];
  
  // Helper function to switch language while maintaining the current page
  const switchLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    // Replace the locale part in the current pathname
    if (pathname) {
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      window.location.href = newPathname;
    } else {
      // Fallback to home page if pathname is null
      window.location.href = `/${newLocale}`;
    }
  };

  // Get site name from settings or fallback
  const siteName = settings?.site_name || 'UmrahGo';
  const logoUrl = getLogoUrl(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex flex-1 items-center justify-between">
          {/* Logo */}
          <Link href={`/`} className="flex items-center space-x-2 rtl:space-x-reverse">
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                {/* Try to show logo image first, fallback to text */}
                {logoUrl && logoUrl !== '/images/logo.png' ? (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Image
                      src={logoUrl}
                      alt={siteName}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                      onError={(e) => {
                        // Hide image on error and show text fallback
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className={cn(
                      "font-bold text-xl text-primary", 
                      "bg-clip-text text-transparent bg-gradient-primary"
                    )}>
                      {siteName}
                    </span>
                  </div>
                ) : (
                  <span className={cn(
                    "font-bold text-2xl text-primary", 
                    "bg-clip-text text-transparent bg-gradient-primary"
                  )}>
                    {siteName}
                  </span>
                )}
              </>
            )}
          </Link>

          {/* Navigation - Desktop */}
          <nav className="mx-6 hidden md:flex md:flex-1 md:justify-center">
            <ul className="flex space-x-6 rtl:space-x-reverse">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Switcher */}
            <button 
              onClick={switchLanguage}
              className="flex items-center space-x-1 rtl:space-x-reverse text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Switch Language"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">
                {locale === 'ar' ? 'EN' : 'العربية'}
              </span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="container py-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
} 