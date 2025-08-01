'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Package, 
  Calendar, 
  Building, 
  MessageCircle, 
  Bell, 
  User, 
  Menu, 
  X, 
  ChevronRight,
  Settings,
  LogOut,
  MapPin,
  Star,
  Award,
  CreditCard,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import UnifiedHeaderWrapper from '@/components/ui/UnifiedHeaderWrapper';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { NotificationSystem } from './components/NotificationSystem';
import { cn } from '@/lib/utils';
import { useUnifiedAuth, UnifiedAuthProvider } from '@/providers/AuthProvider';
import { getLocaleFromParams, type NextParams } from '@/utils/params';
import DebugLocale from '../../../../components/DebugLocale';
import TranslatedText from '@/components/TranslatedText';

interface PilgrimLayoutProps {
  children: React.ReactNode;
  params: NextParams;
}

interface SidebarItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  badge?: string;
  description?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  href, 
  icon: Icon, 
  label, 
  isActive, 
  badge, 
  description 
}) => (
  <Link href={href}>
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer",
        isActive 
          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm border-r-2 border-primary" 
          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
      )}
    >
      <div className={cn(
        "p-2 rounded-lg transition-colors",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{label}</span>
          {badge && (
            <Badge variant="destructive" className="text-xs h-5 px-2">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <ChevronRight className={cn(
        "w-4 h-4 transition-transform",
        isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
      )} />
    </motion.div>
  </Link>
);

const PilgrimLayoutContent = ({ children, params }: PilgrimLayoutProps) => {
  // Fix: Use the utility function to get locale safely
  const locale = getLocaleFromParams(params);
  
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const { data: session } = useSession();
  const { user: authUser } = useUnifiedAuth();
  const [isMobileView, setIsMobileView] = useState(false);
  const [isTabletView, setIsTabletView] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Use user data from either source
  const user = session?.user || authUser;
  const notificationCount = 3; // Replace with actual notification count

  useEffect(() => {
    setHasMounted(true);
    const checkViewport = () => {
      const width = window.innerWidth;
      setIsMobileView(width < 768);
      setIsTabletView(width >= 768 && width < 1024);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const sidebarItems = [
    {
      href: `/${locale}/PilgrimUser`,
      icon: Home,
      label: t('dashboard') || 'الرئيسية',
      description: 'نظرة عامة على نشاطك',
      isActive: pathname === `/${locale}/PilgrimUser`
    },
    {
      href: `/${locale}/PilgrimUser/packages`,
      icon: Package,
      label: t('packages') || 'الباقات',
      description: 'استكشف باقات العمرة',
      isActive: pathname?.includes('/packages') || false
    },
    {
      href: `/${locale}/PilgrimUser/booking`,
      icon: Calendar,
      label: t('bookings') || 'حجوزاتي',
      description: 'إدارة حجوزاتك',
      isActive: pathname?.includes('/booking') || false
    },
    {
      href: `/${locale}/PilgrimUser/offices`,
      icon: Building,
      label: t('offices') || 'المكاتب',
      description: 'مكاتب العمرة المعتمدة',
      isActive: pathname?.includes('/offices') || false
    },
    {
      href: `/${locale}/PilgrimUser/chat`,
      icon: MessageCircle,
      label: t('chats') || 'المحادثات',
      description: 'تواصل مع المكاتب',
      isActive: pathname?.includes('/chat') || false
    },
    {
      href: `/${locale}/PilgrimUser/notifications`,
      icon: Bell,
      label: t('notifications') || 'الإشعارات',
      description: 'آخر التحديثات',
      badge: notificationCount > 0 ? notificationCount.toString() : undefined,
      isActive: pathname?.includes('/notifications') || false
    },
    {
      href: `/${locale}/PilgrimUser/profile`,
      icon: User,
      label: t('profile') || 'الملف الشخصي',
      description: 'إعدادات الحساب',
      isActive: pathname?.includes('/profile') || false
    }
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse">
          <div className="h-16  dark:bg-gray-900 shadow-sm"></div>
          <div className="flex">
            <div className="w-80 h-screen  dark:bg-gray-900 shadow-lg"></div>
            <div className="flex-1 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32  dark:bg-gray-800 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['pilgrim', 'customer']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <UnifiedHeaderWrapper isDashboard={true} showNotifications={true} />
        
        <div className="flex">
          {/* Desktop Sidebar */}
          {!isMobileView && !isTabletView && (
            <motion.aside 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-72 xl:w-80 h-screen sticky top-16 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
            >
              <div className="p-6">
                {/* User Profile Section */}
                <Card className="mb-6 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={user?.image || user?.avatar || user?.profile_photo || ''} 
                          alt={user?.name || 'User'} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">
                          {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {user?.name || 'مستخدم'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email || 'البريد الإلكتروني'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-500">عضو مميز</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <nav className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                    القائمة الرئيسية
                  </div>
                  {sidebarItems.map((item) => (
                    <SidebarItem key={item.href} {...item} />
                  ))}
                </nav>

                {/* Quick Stats */}
                <Card className="mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">إحصائيات سريعة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                          <Calendar className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-sm">الحجوزات</span>
                      </div>
                      <span className="text-sm font-semibold">5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                          <Award className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm">النقاط</span>
                      </div>
                      <span className="text-sm font-semibold">1,250</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded">
                          <CreditCard className="w-3 h-3 text-purple-600" />
                        </div>
                        <span className="text-sm">المدفوعات</span>
                      </div>
                      <span className="text-sm font-semibold">12,500 ر.س</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.aside>
          )}

          {/* Tablet Sidebar */}
          {isTabletView && (
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-20 h-screen sticky top-16 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
            >
              <div className="p-3">
                {/* Compact Navigation for Tablet */}
                <nav className="space-y-3">
                  {sidebarItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex flex-col items-center p-3 rounded-xl transition-all duration-200 cursor-pointer",
                        item.isActive
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg transition-colors mb-1",
                        item.isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                      )}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">
                        {item.label.split(' ')[0]}
                      </span>
                      {item.badge && (
                        <Badge variant="destructive" className="text-xs h-4 px-1 mt-1">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>
              </div>
            </motion.aside>
          )}

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {(isMobileView || isTabletView) && showMobileMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40"
                  onClick={() => setShowMobileMenu(false)}
                />
                <motion.aside
                  variants={sidebarVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 shadow-2xl"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold">القائمة</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-full">
                      <nav className="space-y-2">
                        {sidebarItems.map((item) => (
                          <SidebarItem key={item.href} {...item} />
                        ))}
                      </nav>
                    </ScrollArea>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
          
          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            {/* Mobile/Tablet Menu Button */}
            {(isMobileView || isTabletView) && (
              <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(true)}
                  className="flex items-center gap-2"
                >
                  <Menu className="w-5 h-5" />
                  <span>القائمة</span>
                </Button>
              </div>
            )}

            {/* Content Area */}
            <div className="h-full overflow-y-auto">
              <div className="p-6 lg:p-8">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {pathname?.includes('/notifications') ? (
                    <NotificationSystem />
                  ) : (
                    children
                  )}
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>
      {/* Debug component - only visible in development */}
      {process.env.NODE_ENV !== 'production' && <DebugLocale />}
    </ProtectedRoute>
  );
};

export default function PilgrimLayout({ children, params }: PilgrimLayoutProps) {
  return (
    <UnifiedAuthProvider>
      <PilgrimLayoutContent children={children} params={params} />
    </UnifiedAuthProvider>
  );
} 