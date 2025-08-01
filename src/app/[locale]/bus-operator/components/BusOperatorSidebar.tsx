'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  LayoutDashboard, 
  Calendar, 
  Bus, 
  BookOpen, 
  BarChart3, 
  MessageCircle, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '../redux/store';
import { logout } from '../redux/busOperatorSlice';
import BusOperatorService from '../services/busOperatorService';

const navigation = [
  {
    name: 'dashboard',
    href: '/bus-operator',
    icon: LayoutDashboard,
  },
  {
    name: 'bookings',
    href: '/bus-operator/bookings',
    icon: BookOpen,
  },
  {
    name: 'buses',
    href: '/bus-operator/buses',
    icon: Bus,
  },
  {
    name: 'statistics',
    href: '/bus-operator/statistics',
    icon: BarChart3,
  },
  {
    name: 'calendar',
    href: '/bus-operator/calendar',
    icon: Calendar,
  },
  {
    name: 'chats',
    href: '/bus-operator/chats',
    icon: MessageCircle,
  },
  {
    name: 'profile',
    href: '/bus-operator/profile',
    icon: User,
  },
  {
    name: 'settings',
    href: '/bus-operator/settings',
    icon: Settings,
  },
];

export default function BusOperatorSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations('BusOperatorDashboard');

  const handleLogout = () => {
    BusOperatorService.removeAuthToken();
    dispatch(logout());
    router.push('/auth/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className=" dark:bg-gray-800"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64  dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('title')}
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {t(`navigation.${item.name}`)}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              {t('navigation.logout')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
} 