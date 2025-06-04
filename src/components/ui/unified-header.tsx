"use client";

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
  Moon,
  Bell,
  MessageSquare,
  Settings,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface UnifiedHeaderProps {
  isDashboard?: boolean;
  showNotifications?: boolean;
}

export default function UnifiedHeader({ isDashboard = false, showNotifications = false }: UnifiedHeaderProps) {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [locale, setLocale] = useState<string>('ar');
  const [notificationCount, setNotificationCount] = useState(0);

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
    
    // تحديد عدد الإشعارات (يمكن استبداله بطلب API حقيقي)
    if (showNotifications) {
      setNotificationCount(3); // عدد افتراضي للعرض
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, showNotifications]);

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
  
  // عناصر القائمة المختلفة بناءً على نوع الصفحة
  const getLandingNavItems = () => [
    { href: '/', label: t('nav.home') || 'الرئيسية', icon: <Home className="h-4 w-4" /> },
    { href: '/packages', label: t('nav.packages') || 'باقات العمرة', icon: <Package className="h-4 w-4" /> },
    { href: '/umrah-offices', label: t('nav.offices') || 'مكاتب العمرة', icon: <Building2 className="h-4 w-4" /> },
    { href: '/how-it-works', label: t('nav.howItWorks') || 'كيف يعمل', icon: <HelpCircle className="h-4 w-4" /> },
    { href: '/about-us', label: t('nav.about') || 'عن الشركة', icon: <Building2 className="h-4 w-4" /> },
    { href: '/contact', label: t('nav.contact') || 'اتصل بنا', icon: <Phone className="h-4 w-4" /> },
  ];
  
  const getDashboardNavItems = () => [
    { href: '/PilgrimUser', label: t('nav.dashboard') || 'الرئيسية', icon: <Home className="h-4 w-4" /> },
    { href: '/PilgrimUser/packages', label: t('nav.packages') || 'باقات العمرة', icon: <Package className="h-4 w-4" /> },
    { href: '/PilgrimUser/offices', label: t('nav.offices') || 'مكاتب العمرة', icon: <Building2 className="h-4 w-4" /> },
    { href: '/PilgrimUser/booking', label: t('nav.bookings') || 'حجوزاتي', icon: <ShoppingBag className="h-4 w-4" /> },
  ];
  
  const navItems = isDashboard ? getDashboardNavItems() : getLandingNavItems();
  
  // تأثيرات حركية للهيدر
  const headerVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const dashboardClassName = isDashboard 
    ? "bg-background border-b" 
    : cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-background/95 backdrop-blur-md shadow-sm" 
          : "bg-background/80 backdrop-blur-sm"
      );

  return (
    <motion.header 
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={dashboardClassName}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* الشعار */}
          <Link href={`/${locale}`} className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {isDashboard ? "UmrahGo - بوابة المعتمر" : "UmrahGo"}
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
            
            {/* الإشعارات (تظهر فقط في لوحة التحكم) */}
            {isDashboard && showNotifications && (
              <Button variant="ghost" size="icon" className="relative rounded-full w-9 h-9">
                <Bell className="h-[1.2rem] w-[1.2rem]" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    {notificationCount}
                  </span>
                )}
              </Button>
            )}
            
            {/* حالة تسجيل الدخول */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 hover:bg-primary/5">
                    <Avatar className="h-8 w-8">
                      {user.avatar || user.profile_photo ? (
                        <AvatarImage 
                          src={user.avatar || (user.profile_photo || '')} 
                          alt={user.name} 
                        />
                      ) : (
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm font-medium max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/${isDashboard ? 'PilgrimUser/profile' : 'profile'}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('nav.profile') || 'الملف الشخصي'}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/${isDashboard ? 'PilgrimUser/booking' : 'bookings'}`} className="cursor-pointer">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>{t('nav.myBookings') || 'حجوزاتي'}</span>
                    </Link>
                  </DropdownMenuItem>
                  {isDashboard && (
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/PilgrimUser/settings`} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('nav.settings') || 'الإعدادات'}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
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
            {/* مبدل السمة للموبايل */}
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
            </Button>
            
            {/* زر فتح/إغلاق القائمة */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-full"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* قائمة الموبايل */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <nav className="container mx-auto px-4 py-4 flex flex-col">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={`/${locale}${item.href}`}
                className={cn(
                  "py-3 px-4 text-sm rounded-md flex items-center gap-2",
                  isActive(item.href) 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-primary/5"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            <DropdownMenuRadiochanglang />
            
            {user ? (
              <>
                <Link 
                  href={`/${locale}/${isDashboard ? 'PilgrimUser/profile' : 'profile'}`}
                  className="py-3 px-4 text-sm rounded-md flex items-center gap-2 hover:bg-primary/5"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {t('nav.profile') || 'الملف الشخصي'}
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="py-3 px-4 text-sm rounded-md flex items-center gap-2 text-red-500 hover:bg-red-50 w-full text-right"
                >
                  <LogOut className="h-4 w-4" />
                  {t('nav.logout') || 'تسجيل الخروج'}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-3">
                <Link 
                  href={`/${locale}/auth/login`}
                  className="py-2 px-4 text-sm rounded-md text-center bg-primary/10 text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.login') || 'تسجيل الدخول'}
                </Link>
                <Link 
                  href={`/${locale}/auth/register`}
                  className="py-2 px-4 text-sm rounded-md text-center bg-primary text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.register') || 'إنشاء حساب'}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </motion.header>
  );
} 