"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
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
  ShoppingBag,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DropdownMenuRadiochanglang from "@/components/ui/changlangouge";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from '@/components/ui/notification-dropdown';

interface UnifiedHeaderProps {
  isDashboard?: boolean;
  showNotifications?: boolean;
}

function UnifiedHeaderContent({ isDashboard = false, showNotifications = true }: UnifiedHeaderProps) {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  // Use settings from context
  const { settings, loading: settingsLoading } = useSettings();
  
  // Use proper auth context
  const { state, logout } = useAuth();
  const { user, isLoading, error } = state;

  // States
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Get locale from pathname
  const locale = useLocale();
  const isRtl = locale === 'ar';

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('Auth state changed, updating header');
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('auth_state_changed', handleAuthChange);
    
    // Also listen for storage events (for cross-tab login)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user' || e.key === 'token_type') {
        console.log('Storage changed, updating header');
        setForceUpdate(prev => prev + 1);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('auth_state_changed', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to check current user from localStorage on force update
  useEffect(() => {
    if (forceUpdate > 0 && !user && typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData) {
            console.log('User data found in localStorage, refreshing page');
            router.refresh();
          }
        }
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
    }
  }, [forceUpdate, user, router]);

  // Get site name and logo
  const siteName = settings?.site_name || 'UmrahGo';
  const getLogoUrl = (isDark = false): string => {
    if (!settings) return isDark ? '/images/logo-dark.png' : '/images/logo.png';
    const logoKey = isDark ? 'general.logo_dark' : 'general.logo';
    const logoPath = settings[logoKey];
    
    if (logoPath) {
      return `https://admin.umrahgo.net/storage/${logoPath}`;
    }
    
    return isDark ? '/images/logo-dark.png' : '/images/logo.png';
  };
  const logoUrl = getLogoUrl(theme === 'dark');

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: t('auth.logout.success.title') || "تم تسجيل الخروج بنجاح",
        description: t('auth.logout.success.description') || "نراك قريباً!",
      });
      router.push('/');
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
      const currentPath = pathname.replace(/^\/[a-z]{2}/, '');
      if (path === '/' && (currentPath === '' || currentPath === '/')) {
        return true;
      }
      return currentPath.startsWith(path);
    }
    return false;
  };

  const getLandingNavItems = () => [
    { href: '/', label: t('nav.home') || 'الرئيسية', icon: <Home className="h-4 w-4" /> },
    { href: '/packages', label: t('nav.packages') || 'باقات العمرة', icon: <Package className="h-4 w-4" /> },
    { href: '/umrah-offices', label: t('nav.offices') || 'مكاتب العمرة', icon: <Building2 className="h-4 w-4" /> },
    { href: '/how-it-works', label: t('nav.howItWorks') || 'كيف يعمل', icon: <HelpCircle className="h-4 w-4" /> },
    { href: '/about-us', label: t('nav.about') || 'عن الشركة', icon: <Building2 className="h-4 w-4" /> },
    { href: '/contact', label: t('nav.contact') || 'اتصل بنا', icon: <Phone className="h-4 w-4" /> },
  ];

  const getDashboardNavItems = () => [
    { href: '/', label: t('nav.dashboard') || 'الرئيسية', icon: <Home className="h-4 w-4" /> },
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

  // إنشاء محتوى قائمة المستخدم
  const renderUserMenuContent = () => {
    // Get the user's role to determine where to direct them
    const userRole = getUserRole();
    const dashboardLink = getDashboardLink(userRole);

    return (
      <>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user?.name || 'المستخدم'}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {user?.email || ''}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardLink}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>{t('nav.dashboard') || 'لوحة التحكم'}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`${dashboardLink}/profile`}>
            <User className="mr-2 h-4 w-4" />
            <span>{t('nav.profile') || 'الملف الشخصي'}</span>
          </Link>
        </DropdownMenuItem>
        {userRole === 'pilgrim' && (
          <DropdownMenuItem asChild>
            <Link href={'/PilgrimUser/booking'}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>{t('nav.bookings') || 'حجوزاتي'}</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href={`${dashboardLink}/settings`}>
            <Settings className="mr-2 h-4 w-4" />
            <span>{t('nav.settings') || 'الإعدادات'}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('nav.logout') || 'تسجيل الخروج'}</span>
        </DropdownMenuItem>
      </>
    );
  };

  // Helper function to determine user role
  const getUserRole = (): 'office' | 'bus_operator' | 'pilgrim' | 'admin' => {
    if (!user) return 'pilgrim';
    
    // Debug log to understand the user data structure
    console.log('User data for role detection in header:', {
      roles: user.roles,
      umrah_office: user,
      office: user.office
    });
    
    // Check if user has roles array
    if (user.roles && Array.isArray(user.roles)) {
      // Legacy: roles might be an array of strings
      if (typeof user.roles[0] === 'string') {
        if (user.roles.includes('office')) return 'office';
        if (user.roles.includes('bus_operator') || user.roles.includes('bus-operator')) return 'bus_operator';
        if (user.roles.includes('admin')) return 'admin';
      }
      // Modern: roles might be an array of objects with name property
      else if (user.roles[0] && typeof user.roles[0] === 'object') {
        try {
          // Extract role names, handling possible different structures
          const roleNames = user.roles.map((role: any) => {
            if (typeof role === 'string') return role;
            if (role && typeof role === 'object' && 'name' in role) return role.name;
            return '';
          }).filter(Boolean);

          console.log('Extracted role names in header:', roleNames);
          
          if (roleNames.includes('office')) return 'office';
          if (roleNames.includes('bus_operator') || roleNames.includes('bus-operator')) return 'bus_operator';
          if (roleNames.includes('admin')) return 'admin';
        } catch (error) {
          console.error('Error processing roles array in header:', error);
        }
      }
    }
    // Check for umrah_office property - this is present in the API response for office users
    if ('umrah_office' in user && user.umrah_office) {
      console.log('User has umrah_office property in header:', user.umrah_office);
      return 'office';
    }
    // Check for office property - might be used in some contexts
    if (user.office) {
      console.log('User has office property in header:', user.office);
      return 'office';
    }
    
    // Default to pilgrim
    return 'pilgrim';
  };

  // Helper function to get dashboard link based on role
  const getDashboardLink = (role: 'office' | 'bus_operator' | 'pilgrim' | 'admin'): string => {
    switch (role) {
      case 'office':
        return `/umrahoffices/dashboard`;
      case 'bus_operator':
        return `/bus-operator`;
      case 'admin':
        return `/admin/dashboard`;
      case 'pilgrim':
      default:
        return `/PilgrimUser`;
    }
  };

  if (!mounted) return null;

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>

    <motion.header 
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={dashboardClassName}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
          {/* الشعار */}
          <Link href={'/'} className="flex items-center space-x-2 rtl:space-x-reverse">
            {settingsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                {/* Try to show logo image first, fallback to text */}
                {logoUrl && logoUrl !== '/images/logo.png' && logoUrl !== '/images/logo-dark.png' ? (
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
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {isDashboard ? `${siteName} - بوابة المعتمر` : siteName}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {isDashboard ? `${siteName} - بوابة المعتمر` : siteName}
                  </span>
                )}
              </>
            )}
          </Link>

          {/* قائمة التنقل للشاشات الكبيرة */}
          <nav className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse xl:space-x-2">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "px-2 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 lg:px-3 lg:py-2 lg:gap-1.5 xl:text-base",
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
          <div className="hidden lg:flex items-center space-x-2 rtl:space-x-reverse xl:space-x-3">
            {/* التبديل بين الثيمات */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="w-9 px-0"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">تبديل الثيم</span>
            </Button>

            {/* تغيير اللغة */}
            <DropdownMenuRadiochanglang />

            {/* Show notifications if logged in and notifications are enabled */}
            {showNotifications && user && (
              <NotificationDropdown maxItems={5} />
            )}

            {/* Link to chats page if logged in */}
            {user && (
              <Link href={`${getDashboardLink(getUserRole())}/chats`}>
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* قائمة المستخدم أو أزرار تسجيل الدخول */}
            {isLoading ? (
              <Skeleton className="h-9 w-24 rounded-full" />
            ) : user ? (
              <>
                {/* Show dashboard button next to user avatar for desktop */}
                <Link href={getDashboardLink(getUserRole())}>
                  <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1.5 mr-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{t('nav.dashboard') || 'لوحة التحكم'}</span>
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar || user.profile_photo || ''} alt={user.name || ''} />
                        <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    {renderUserMenuContent()}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link href={'/auth/login'}>
                  <Button variant="ghost" size="sm">
                    {t('nav.login') || 'تسجيل الدخول'}
                  </Button>
                </Link>
                <Link href={'/auth/register'}>
                  <Button size="sm">
                    {t('nav.register') || 'حساب جديد'}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* زر قائمة الموبايل والتابلت */}
          <div className="lg:hidden flex items-center gap-1 sm:gap-2">
            {/* Show notifications if logged in and notifications are enabled (mobile) */}
            {showNotifications && user && (
              <NotificationDropdown maxItems={5} />
            )}
            
            {/* تغيير اللغة للموبايل */}
            <DropdownMenuRadiochanglang />
            
            {/* زر قائمة الموبايل */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* قائمة الموبايل والتابلت */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-3 pt-3 pb-4 space-y-2 sm:px-4 sm:space-y-3">
              {/* عرض معلومات المستخدم في الموبايل */}
              {user && (
                <div className="p-3 border-b mb-3 sm:p-4 sm:mb-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse sm:space-x-3">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                      <AvatarImage src={user.avatar || user.profile_photo || ''} alt={user.name || ''} />
                      <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name || 'المستخدم'}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">{user.email || ''}</p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 sm:flex sm:gap-2 sm:flex-wrap">
                    {/* Link to dashboard based on user role */}
                    <Link href={getDashboardLink(getUserRole())}>
                      <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs sm:text-sm">
                        <LayoutDashboard className="h-3 w-3" />
                        <span className="hidden xs:inline">{t('nav.dashboard') || 'لوحة التحكم'}</span>
                        <span className="xs:hidden">لوحة</span>
                      </Button>
                    </Link>
                    <Link href={`${getDashboardLink(getUserRole())}/profile`}>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{t('nav.profile') || 'الملف الشخصي'}</span>
                      </Button>
                    </Link>
                    <Link href={`${getDashboardLink(getUserRole())}/chats`}>
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{t('nav.chats') || 'المحادثات'}</span>
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={handleLogout}>
                      <LogOut className="h-3 w-3" />
                      <span>{t('nav.logout') || 'تسجيل الخروج'}</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                      {theme === "light" ? (
                        <>
                          <Moon className="h-3 w-3" />
                          <span>مظلم</span>
                        </>
                      ) : (
                        <>
                          <Sun className="h-3 w-3" />
                          <span>مضيء</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors sm:text-base sm:py-3",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="mr-2 rtl:ml-2 sm:mr-3 sm:rtl:ml-3">{item.label}</span>
                </Link>
              ))}

              {!user && (
                <div className="pt-4 space-y-2">
                  <Link href={'/auth/login'}>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                      {t('nav.login') || 'تسجيل الدخول'}
                    </Button>
                  </Link>
                  <Link href={'/auth/register'}>
                    <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      {t('nav.register') || 'حساب جديد'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </motion.header>
    </ThemeProvider>
  );
}

// Use React.memo to prevent unnecessary re-renders
import React from 'react';
import { ThemeProvider } from "next-themes";
const MemoizedUnifiedHeaderContent = React.memo(UnifiedHeaderContent);

export default function UnifiedHeader(props: UnifiedHeaderProps) {
  return <MemoizedUnifiedHeaderContent {...props} />;
} 