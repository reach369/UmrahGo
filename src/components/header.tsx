"use client";

// استيراد المكتبات والمكونات اللازمة
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  Package, 
  HelpCircle, 
  Home, 
  Phone, 
  Building2,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DropdownMenuRadiochanglang from "@/components/ui/changlangouge";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/auth.service";
import { UserDetails } from "@/types/auth.types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// المكون الرئيسي للهيدر
export default function Header() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [locale, setLocale] = useState<string>('ar');

  useEffect(() => {
    // التحقق من وجود مستخدم مسجل
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
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

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast({
        title: t('auth.logout.success.title') || "تم تسجيل الخروج بنجاح",
        description: t('auth.logout.success.description') || "نراك قريباً!",
      });
      router.push(`/${locale}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('auth.logout.error.title') || "خطأ في تسجيل الخروج",
        description: error.message || t('auth.logout.error.description') || "حدث خطأ أثناء تسجيل الخروج",
      });
    }
  };
  
  const isActive = (path: string) => {
    if (pathname) {
      // تحقق من المسار الحالي بدون البادئة اللغوية
      const currentPath = pathname.replace(/^\/[a-z]{2}/, '');
      // إذا كانت الصفحة الرئيسية
      if (path === '/' && (currentPath === '' || currentPath === '/')) {
        return true;
      }
      // للمسارات الأخرى
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
  
  // تأثيرات حركية للهيدر
  const headerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
          <Link href={`/${locale}`} className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              UmrahGo
            </span>
          </Link>

          {/* قائمة التنقل للشاشات الكبيرة */}
          <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={`/${locale}${item.href}`}
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
            
            {/* حالة تسجيل الدخول */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 hover:bg-primary/5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('nav.profile') || 'الملف الشخصي'}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/bookings`} className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>{t('nav.myBookings') || 'حجوزاتي'}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-500 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('nav.logout') || 'تسجيل الخروج'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
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
            )}
          </div>

          {/* زر قائمة الموبايل */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full w-9 h-9"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
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
                  href={`/${locale}${item.href}`}
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
            
            {/* مبدل اللغة */}
            <div className="px-4 py-2 border-t">
              <DropdownMenuRadiochanglang />
            </div>
            
            {/* حالة تسجيل الدخول */}
            <div className="px-4 py-2 border-t">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/${locale}/profile`} onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {t('nav.profile') || 'الملف الشخصي'}
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={handleLogout}
                    >
                      {t('nav.logout') || 'تسجيل الخروج'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/${locale}/auth/login`} onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      {t('nav.login') || 'تسجيل الدخول'}
                    </Button>
                  </Link>
                  <Link href={`/${locale}/auth/register`} onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
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