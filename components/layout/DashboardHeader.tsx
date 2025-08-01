"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { 
  LogOut, 
  ChevronDown, 
  User, 
  Package, 
  Sun,
  Moon,
  LayoutDashboard
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
import NotificationBadge from "@/components/NotificationBadge";

// Props for the component
interface DashboardHeaderProps {
  user: UserDetails;
}

// المكون الرئيسي لهيدر لوحة التحكم
export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [locale, setLocale] = useState<string>('ar');

  useEffect(() => {
    // معرفة اللغة الحالية من المسار
    if (pathname) {
      const pathParts = pathname.split('/');
      if (pathParts.length > 1 && (pathParts[1] === 'ar' || pathParts[1] === 'en')) {
        setLocale(pathParts[1]);
      }
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: t('auth.logout.success.title') || "تم تسجيل الخروج بنجاح",
        description: t('auth.logout.success.description') || "نراك قريباً!",
      });
      // Redirect to home page after logout
      router.push('/');
      router.refresh(); // Force a refresh to update the header state
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('auth.logout.error.title') || "خطأ في تسجيل الخروج",
        description: error.message || t('auth.logout.error.description') || "حدث خطأ أثناء تسجيل الخروج",
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* الشعار ورابط لوحة التحكم */}
        <Link href="/dashboard" className="flex items-center gap-2">
           <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              UmrahGo
            </span>
          <span className="text-muted-foreground hidden sm:inline-block">/ {t('nav.dashboard') || 'لوحة التحكم'}</span>
        </Link>

        {/* الإجراءات */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {/* إشعارات */}
            <NotificationBadge />
            
            {/* مبدل السمة */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full w-9 h-9"
            >
              {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* مبدل اللغة */}
            <DropdownMenuRadiochanglang />

            {/* قائمة المستخدم */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="relative h-8 w-8 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex flex-col items-start">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>{t('nav.dashboard') || 'لوحة التحكم'}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('nav.profile') || 'الملف الشخصي'}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>{t('nav.myBookings') || 'حجوزاتي'}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('nav.logout') || 'تسجيل الخروج'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
