'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Phone, 
  Mail, 
  MapPin,
  Home,
  Package,
  Building,
  HelpCircle,
  Info,
  MessageSquare,
  FileText,
  Shield,
  Cookie,
  FileCheck
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface FooterProps {
  locale?: string;
}

export default function Footer({ locale: propLocale }: FooterProps) {
  // Use prop locale if provided, otherwise get from params
  const params = useParams();
  const locale = propLocale || (params?.locale as string) || 'ar';
  const t = useTranslations();
  const { theme } = useTheme();
  
  const year = new Date().getFullYear();

  // Quick links with icons
  const quickLinks = [
    { href: `/${locale}`, label: t('nav.home') || 'الرئيسية', icon: <Home className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> },
    { href: `/${locale}/landing/packages`, label: t('nav.packages') || 'الباقات', icon: <Package className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> },
    { href: `/${locale}/landing/umrah-offices`, label: t('nav.offices') || 'مكاتب العمرة', icon: <Building className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> },
    { href: `/${locale}/landing/how-it-works`, label: t('nav.howItWorks') || 'كيف نعمل', icon: <HelpCircle className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> },
    { href: `/${locale}/landing/about-us`, label: t('nav.aboutUs') || 'من نحن', icon: <Info className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> },
    { href: `/${locale}/landing/contact`, label: t('nav.contact') || 'اتصل بنا', icon: <MessageSquare className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> },
  ];

  // Legal links with icons
  const legalLinks = [
    { href: `/${locale}/landing/terms`, label: t('footer.termsOfService') || 'شروط الخدمة', icon: <FileText className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> },
    { href: `/${locale}/landing/privacy`, label: t('footer.privacyPolicy') || 'سياسة الخصوصية', icon: <Shield className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> },
    { href: `/${locale}/landing/cookie-policy`, label: t('footer.cookiePolicy') || 'سياسة ملفات تعريف الارتباط', icon: <Cookie className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> },
    { href: `/${locale}/landing/license-agreement`, label: t('footer.licenseAgreement') || 'اتفاقية الترخيص', icon: <FileCheck className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" /> },
  ];

  return (
    <footer className="bg-background dark:bg-gray-900 pt-8 pb-6 border-t border-border sm:pt-12">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 xl:gap-12">
          {/* Company Information */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={`/${locale}`}>
              <h2 className="text-xl font-bold text-primary dark:text-primary mb-3 sm:text-2xl sm:mb-4">UmrahGo</h2>
            </Link>
            <p className="text-sm text-muted-foreground dark:text-gray-300 mb-4 max-w-sm sm:text-base sm:mb-6">
              {t('footer.description') || 'نقدم خدمات العمرة المتكاملة بأعلى معايير الجودة والراحة لضمان رحلة روحانية مميزة'}
            </p>
            <div className="flex space-x-3 rtl:space-x-reverse sm:space-x-4">
              <a href="#" aria-label={t('footer.social.facebook') || 'Facebook'} className="text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" aria-label={t('footer.social.twitter') || 'Twitter'} className="text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" aria-label={t('footer.social.instagram') || 'Instagram'} className="text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" aria-label={t('footer.social.linkedin') || 'LinkedIn'} className="text-muted-foreground hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-base font-semibold mb-3 text-foreground dark:text-white sm:text-lg sm:mb-4">{t('footer.quickLinks') || 'روابط سريعة'}</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-1.5 sm:text-base sm:gap-2">
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-base font-semibold mb-3 text-foreground dark:text-white sm:text-lg sm:mb-4">{t('footer.legal') || 'قانوني'}</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors flex items-center gap-1.5 sm:text-base sm:gap-2">
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-base font-semibold mb-3 text-foreground dark:text-white sm:text-lg sm:mb-4">{t('footer.contactUs') || 'اتصل بنا'}</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5 me-1.5 sm:h-5 sm:w-5 sm:me-2" />
                <span className="text-sm text-muted-foreground dark:text-gray-300 sm:text-base">
                  {t('footer.address') || 'شارع الملك فهد، الرياض، المملكة العربية السعودية'}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 text-primary shrink-0 me-1.5 sm:h-5 sm:w-5 sm:me-2" />
                <a href="tel:+966500000000" className="text-sm text-muted-foreground hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors sm:text-base">
                  +966 50 000 0000
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 text-primary shrink-0 me-1.5 sm:h-5 sm:w-5 sm:me-2" />
                <a href="mailto:info@umrahgo.com" className="text-sm text-muted-foreground hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors sm:text-base">
                  info@umrahgo.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border dark:border-gray-700 sm:mt-10 sm:pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
            <p className="text-center text-muted-foreground dark:text-gray-400 text-xs sm:text-sm">
              © {year} UmrahGo. {t('footer.allRightsReserved') || 'جميع الحقوق محفوظة.'}
            </p>
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.privacy') || 'سياسة الخصوصية'}
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                {t('footer.terms') || 'الشروط والأحكام'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 