'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function Header() {
  const params = useParams();
  const pathname = usePathname();
  const locale = params?.locale as string || 'ar';
  const t = useTranslations();
  const isRtl = locale === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: t('nav.home') || 'الرئيسية', href: `/${locale}` },
    { name: t('nav.packages') || 'الباقات', href: `/${locale}/packages` },
    { name: t('nav.offices') || 'مكاتب العمرة', href: `/${locale}/umrah-offices` },
    { name: t('nav.howItWorks') || 'كيف نعمل', href: `/${locale}/how-it-works` },
    { name: t('nav.aboutUs') || 'من نحن', href: `/${locale}/about-us` },
    { name: t('nav.contact') || 'اتصل بنا', href: `/${locale}/contact` },
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex flex-1 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <span className={cn(
              "font-bold text-2xl text-primary", 
              "bg-clip-text text-transparent bg-gradient-primary"
            )}>
              UmrahGo
            </span>
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
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button 
              onClick={switchLanguage}
              className="p-2 rounded-full hover:bg-primary/10 transition-colors"
              aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Globe className="h-5 w-5 text-primary" />
              <span className="sr-only">{locale === 'ar' ? 'English' : 'العربية'}</span>
            </button>
            
            <ThemeToggle />
            
            <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse">
              <Link href={`/${locale}/auth/login`}>
                <button className="px-4 py-2 text-sm text-primary rounded-full border border-primary/20 hover:bg-primary/5 transition-colors">
                  {t('nav.login') || 'تسجيل الدخول'}
                </button>
              </Link>
              <Link href={`/${locale}/auth/register`}>
                <button className="px-4 py-2 text-sm text-primary-foreground rounded-full btn-gradient-primary">
                  {t('nav.register') || 'حساب جديد'}
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">فتح القائمة</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 py-5 border-t border-border/20">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg py-2 text-base text-foreground hover:bg-accent/50 px-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 flex flex-col space-y-2">
              <Link href={`/${locale}/auth/login`} onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full py-2 text-sm text-primary rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors">
                  {t('nav.login') || 'تسجيل الدخول'}
                </button>
              </Link>
              <Link href={`/${locale}/auth/register`} onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full py-2 text-sm text-primary-foreground rounded-lg btn-gradient-primary">
                  {t('nav.register') || 'حساب جديد'}
                </button>
              </Link>
              
              {/* Language Toggle in Mobile Menu */}
              <button 
                onClick={switchLanguage}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2 text-sm rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors"
              >
                <Globe className="h-4 w-4 text-primary" />
                <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 