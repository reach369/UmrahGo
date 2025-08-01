"use client";

// استيراد المكتبات والمكونات اللازمة
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { 
  Menu, 
  X, 
  Package, 
  HelpCircle, 
  Home, 
  Phone, 
  Building2,
  Sun,
  Moon,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DropdownMenuRadiochanglang from "@/components/ui/changlangouge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

// المكون الرئيسي لهيدر الصفحات العامة
export default function LandingHeader() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [locale, setLocale] = useState<string>('ar');

  useEffect(() => {
    // معرفة اللغة الحالية من المسار
    if (pathname) {
      const pathParts = pathname.split('/');
      if (pathParts.length > 1 && (pathParts[1] === 'ar' || pathParts[1] === 'en')) {
        setLocale(pathParts[1]);
      }
    }
    
    // إضافة مستمع لحدث التمرير لتغيير مظهر الهيدر
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  const isActive = (path: string) => {
    if (pathname) {
      const currentPath = pathname.replace(/^\/(ar|en)/, '');
      if (path === '/' && (currentPath === '' || currentPath === '/')) {
        return true;
      }
      return currentPath.startsWith(path);
    }
    return false;
  };
  
  const navItems = [
    { href: '/landing/home', label: t('nav.home') || 'الرئيسية', icon: <Home className="h-4 w-4" /> },
    { href: '/landing/packages', label: t('nav.packages') || 'باقات العمرة', icon: <Package className="h-4 w-4" /> },
    { href: '/landing/how-it-works', label: t('nav.howItWorks') || 'كيف يعمل', icon: <HelpCircle className="h-4 w-4" /> },
    { href: '/landing/about-us', label: t('nav.about') || 'عن الشركة', icon: <Building2 className="h-4 w-4" /> },
    { href: '/landing/contact', label: t('nav.contact') || 'اتصل بنا', icon: <Phone className="h-4 w-4" /> },
  ];
  
  const headerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // تحديد زر تسجيل الدخول أو معلومات المستخدم بناءً على حالة الجلسة
  const renderAuthButtons = () => {
    if (isLoading) {
      return (
        <div className="h-9 w-24 bg-muted animate-pulse rounded-full"></div>
      );
    }

    if (isAuthenticated && user) {
      return (
        <div className="flex items-center gap-2">
          <Link href={`/${locale}/PilgrimUser`}>
            <Button variant="outline" size="sm" className="rounded-full px-4">
              {t('nav.dashboard') || 'لوحة التحكم'}
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link href={`/${locale}/auth/login`}>
          <Button variant="outline" size="sm" className="rounded-full px-4">
            {t('nav.login') || 'تسجيل الدخول'}
          </Button>
        </Link>
        <Link href={`/${locale}/auth/register`}>
          <Button size="sm" className="rounded-full px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
            {t('nav.register') || 'إنشاء حساب'}
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <motion.header 
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-background/95 backdrop-blur-md shadow-sm" 
          : "bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* الشعار */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              UmrahGo
            </span>
          </Link>

          {/* قائمة التنقل للشاشات الكبيرة */}
          <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-1.5",
                  isActive(item.href) 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-primary/5 hover:text-primary"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* أزرار الإجراءات للشاشات الكبيرة */}
          <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse">
            {/* إشعارات - تظهر فقط للمستخدمين المسجلين */}
            {/* {isAuthenticated && (
              <NotificationBadge />
            )} */}
            
            {/* مبدل السمة (الوضع الداكن/الفاتح) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full w-9 h-9"
            >
              {theme === 'dark' ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {/* مبدل اللغة */}
            <DropdownMenuRadiochanglang />
            
            {/* أزرار تسجيل الدخول / معلومات المستخدم */}
            {renderAuthButtons()}
          </div>

          {/* أزرار الموبايل */}
          <div className="flex items-center gap-2 md:hidden">
            {/* زر تبديل اللغة للموبايل */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newLocale = locale === 'ar' ? 'en' : 'ar';
                setLocale(newLocale);
                const pathWithoutLocale = pathname?.replace(/^\/(ar|en)/, '');
                window.location.href = `/${newLocale}${pathWithoutLocale}`;
              }}
              className="rounded-full w-9 h-9"
            >
              <Globe className="h-5 w-5" />
            </Button>
            
            {/* زر تبديل السمة للموبايل */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full w-9 h-9"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {/* زر القائمة للموبايل */}
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* قائمة الموبايل */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden py-4 space-y-4 bg-background border-t"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "px-4 py-3 flex items-center space-x-3 rtl:space-x-reverse",
                    isActive(item.href) 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-primary/5"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            
            {/* عرض معلومات المستخدم في قائمة الموبايل */}
            <div className="px-4 py-2 border-t">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {user.profile_photo || user.avatar ? (
                        <img 
                          src={user.profile_photo || user.avatar} 
                          alt={user.name || "User"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-primary">
                          {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <Link href={`/${locale}/PilgrimUser`} onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full" size="sm">
                      {t('nav.dashboard') || 'لوحة التحكم'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href={`/${locale}/auth/login`} onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full" size="sm">
                      {t('nav.login') || 'تسجيل الدخول'}
                    </Button>
                  </Link>
                  <Link href={`/${locale}/auth/register`} onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full" size="sm">
                      {t('nav.register') || 'إنشاء حساب'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
