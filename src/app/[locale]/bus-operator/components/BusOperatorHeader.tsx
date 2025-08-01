'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bell, Search, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '../redux/store';

export default function BusOperatorHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user } = useAppSelector((state) => state.busOperator);
  const t = useTranslations('BusOperatorDashboard');

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would implement your dark mode logic
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className=" dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={t('common.search')}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                العربية
              </DropdownMenuItem>
              <DropdownMenuItem>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold">الإشعارات</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start p-4">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">حجز جديد</span>
                    <span className="text-xs text-gray-500">منذ 5 دقائق</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    تم استلام حجز جديد للباص رقم 123
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start p-4">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">تحديث الحالة</span>
                    <span className="text-xs text-gray-500">منذ ساعة</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    تم تأكيد الحجز #456
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start p-4">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">رسالة جديدة</span>
                    <span className="text-xs text-gray-500">منذ ساعتين</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    رسالة جديدة من مكتب العمرة
                  </span>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center p-2">
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  عرض جميع الإشعارات
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={user?.profile_photo} 
                    alt={user?.name} 
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0)?.toUpperCase() || 'BO'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {user?.name || 'Bus Operator'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                {user?.company_name && (
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.company_name}
                  </p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {t('profile.title')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {t('navigation.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                {t('navigation.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 