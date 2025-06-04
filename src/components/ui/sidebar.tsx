"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { 
  User, 
  Package, 
  Home, 
  ShoppingBag,
  Bell,
  Settings,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Building2,
  Star,
  CreditCard,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  className?: string;
  locale: string;
}

export default function Sidebar({ className, locale }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // التحقق من حجم الشاشة
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // إذا كان الحجم للموبايل، نقوم بطي الشريط الجانبي تلقائيًا
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const isActive = (path: string) => {
    if (!pathname) return false;
    return pathname.includes(path);
  };
  
  // تعريف مجموعات القائمة
  const mainNavItems = [
    { href: '/PilgrimUser', label: t('pilgrim.dashboard') || 'الرئيسية', icon: Home },
    { href: '/PilgrimUser/packages', label: t('pilgrim.packages') || 'باقات العمرة', icon: Package },
    { href: '/PilgrimUser/offices', label: t('pilgrim.offices') || 'مكاتب العمرة', icon: Building2 },
    { href: '/PilgrimUser/booking', label: t('pilgrim.bookings') || 'حجوزاتي', icon: ShoppingBag },
  ];
  
  const accountNavItems = [
    { href: '/PilgrimUser/profile', label: t('pilgrim.profile') || 'الملف الشخصي', icon: User },
    { href: '/PilgrimUser/notifications', label: t('pilgrim.notifications') || 'الإشعارات', icon: Bell },
    { href: '/PilgrimUser/favorites', label: t('pilgrim.favorites') || 'المفضلة', icon: Star },
    { href: '/PilgrimUser/payments', label: t('pilgrim.payments') || 'المدفوعات', icon: CreditCard },
  ];
  
  const otherNavItems = [
    { href: '/PilgrimUser/settings', label: t('pilgrim.settings') || 'الإعدادات', icon: Settings },
    { href: '/PilgrimUser/support', label: t('pilgrim.support') || 'الدعم والمساعدة', icon: HelpCircle },
  ];
  
  return (
    <div
      className={cn(
        "relative h-screen border-l lg:border-l",
        isCollapsed ? "w-16" : "w-64",
        "transition-all duration-300",
        !isMobile && "sticky top-0",
        className
      )}
    >
      <div className="flex justify-end p-3 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isCollapsed ? "Expand" : "Collapse"}
          </span>
        </Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-64px)] pb-10">
        <div className="px-2 py-2">
          {/* زر طي/فتح الشريط الجانبي */}
          <div className="hidden lg:flex justify-end mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isCollapsed ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isCollapsed ? "Expand" : "Collapse"}
              </span>
            </Button>
          </div>
          
          {/* القائمة الرئيسية */}
          <div className="mb-4">
            {!isCollapsed && (
              <div className="mb-2 px-4">
                <h3 className="text-xs font-medium text-muted-foreground">
                  {t('pilgrim.mainMenu') || 'القائمة الرئيسية'}
                </h3>
              </div>
            )}
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[1.2rem] w-[1.2rem]" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
          
          {/* إدارة الحساب */}
          <div className="mb-4">
            {!isCollapsed && (
              <>
                <Separator className="my-3" />
                <div className="mb-2 px-4">
                  <h3 className="text-xs font-medium text-muted-foreground">
                    {t('pilgrim.accountManagement') || 'إدارة الحساب'}
                  </h3>
                </div>
              </>
            )}
            <div className="space-y-1">
              {accountNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[1.2rem] w-[1.2rem]" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
          
          {/* إعدادات أخرى */}
          <div className="mb-4">
            {!isCollapsed && (
              <>
                <Separator className="my-3" />
                <div className="mb-2 px-4">
                  <h3 className="text-xs font-medium text-muted-foreground">
                    {t('pilgrim.others') || 'أخرى'}
                  </h3>
                </div>
              </>
            )}
            <div className="space-y-1">
              {otherNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[1.2rem] w-[1.2rem]" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
} 