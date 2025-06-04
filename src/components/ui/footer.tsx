'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const t = useTranslations();

  const year = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 pt-16 pb-6 border-t border-border/20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div>
            <Link href={`/${locale}/landing/home`}>
              <h2 className="text-2xl font-bold text-gradient-primary mb-4">UmrahGo</h2>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {t('footer.description') || 'نقدم خدمات العمرة المتكاملة بأعلى معايير الجودة والراحة لضمان رحلة روحانية مميزة'}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks') || 'روابط سريعة'}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}`} className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.home') || 'الرئيسية'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/packages`} className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.packages') || 'الباقات'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/how-it-works`} className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.howItWorks') || 'كيف نعمل'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about-us`} className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.aboutUs') || 'من نحن'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-muted-foreground hover:text-primary transition-colors">
                  {t('nav.contact') || 'اتصل بنا'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.legal') || 'قانوني'}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/terms`} className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.termsOfService') || 'شروط الخدمة'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.privacyPolicy') || 'سياسة الخصوصية'}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.cookiePolicy') || 'سياسة ملفات تعريف الارتباط'}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.licenseAgreement') || 'اتفاقية الترخيص'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contactUs') || 'اتصل بنا'}</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5 me-2" />
                <span className="text-muted-foreground">
                  {t('footer.address') || 'شارع الملك فهد، الرياض، المملكة العربية السعودية'}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary shrink-0 me-2" />
                <a href="tel:+966500000000" className="text-muted-foreground hover:text-primary transition-colors">
                  +966 50 000 0000
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary shrink-0 me-2" />
                <a href="mailto:info@umrahgo.com" className="text-muted-foreground hover:text-primary transition-colors">
                  info@umrahgo.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/10">
          <p className="text-center text-muted-foreground text-sm">
            © {year} UmrahGo. {t('footer.allRightsReserved') || 'جميع الحقوق محفوظة.'}
          </p>
        </div>
      </div>
    </footer>
  );
} 