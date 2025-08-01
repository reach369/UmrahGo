'use client';

import { useState, useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useAppSelector } from '../hooks/reduxHooks';
import { useLocale } from '@/hooks/useLocale';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  CreditCard,
  Package,
  Bus,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  SunMoon,
  Building2,
  PlusCircle,
  Image,
  ClipboardList,
  Crown,
  MessageCircle,
  User,
  FileText,
  PictureInPicture
} from 'lucide-react';
import DropdownMenuRadiochanglang from '@/components/ui/changlangouge';

export default function Sidebar() {
  const t = useTranslations('Navigation');
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [officeMenuOpen, setOfficeMenuOpen] = useState(true);
  const [busMenuOpen, setBusMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  
  // Get user from Redux store
  const { user } = useAppSelector(state => state.auth);

  // Auto-expand menus based on current path
  useEffect(() => {
    if (pathname?.includes('/umrahoffices/dashboard/bus')) {
      setBusMenuOpen(true);
    }
    if (
      pathname?.includes('/umrahoffices/dashboard/bookings') ||
      pathname?.includes('/umrahoffices/dashboard/payments') ||
      pathname?.includes('/umrahoffices/packages') 
    ) {
      setOfficeMenuOpen(true);
    }
  }, [pathname]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    // Clear all tokens and user data from storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to login page
    window.location.href = `/auth/login`;
  };
  
  // Helper function to check if a link is active
  const isActive = (path: string) => {
      return pathname === path || pathname?.startsWith(path);
  };
  
  // Function to get link classes based on active state
  const getLinkClasses = (path: string, baseClasses: string) => {
    return `${baseClasses} ${isActive(path) ? 'bg-gray-100 dark:bg-gray-700' : ''}`;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        data-drawer-target="sidebar-multi-level-sidebar"
        data-drawer-toggle="sidebar-multi-level-sidebar"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <span className="sr-only">فتح القائمة</span>
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        id="sidebar-multi-level-sidebar"
        className={`fixed top-0 right-0 z-40 w-64 h-screen transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'
        }`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto  dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
          {/* Logo and Office Name */}
          <div className="flex items-center justify-between mb-5 p-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || t('umrahOffices')}</span>
          </div>

          <ul className="space-y-2 font-medium">
            <li>
              <Link
                href={`/umrahoffices/dashboard`}
                className={getLinkClasses(`/umrahoffices/dashboard`, "flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group")}
              >
                <LayoutDashboard className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="ms-3">{t('dashboard')}</span>
              </Link>
            </li>

            {/* Office Management Section */}
            <li>
              <button
                type="button"
                className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                onClick={() => setOfficeMenuOpen(!officeMenuOpen)}
              >
                <Building2 className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="flex-1 ms-3 text-right">{t('officeManagement')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${officeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <ul className={`${officeMenuOpen ? 'block' : 'hidden'} py-2 space-y-2`}>
              <li>
                  <Link
                    href={`/umrahoffices/dashboard/packages`}
                    className={getLinkClasses(`/umrahoffices/packages`, "flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700")}
                  >
                    <Package className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('packages')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/umrahoffices/dashboard/bookings`}
                    className={getLinkClasses(`/umrahoffices/dashboard/bookings`, "flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700")}
                  >
                    <BookOpen className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('bookings')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/umrahoffices/dashboard/payments`}
                    className={getLinkClasses(`/umrahoffices/dashboard/payments`, "flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700")}
                  >
                    <CreditCard className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('payments')}</span>
                  </Link>
                </li>
               
               
               
              </ul>
            </li>

            {/* Bus Management Section */}
            {/* <li>
              <button
                type="button"
                className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                onClick={() => setBusMenuOpen(!busMenuOpen)}
              >
                <Bus className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="flex-1 ms-3 text-right">{t('busManagement')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${busMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <ul className={`${busMenuOpen ? 'block' : 'hidden'} py-2 space-y-2`}>
                <li>
                  <Link
                    href={`/umrahoffices/dashboard/bus/register`}
                    className={getLinkClasses(`/umrahoffices/dashboard/bus/register`, "flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700")}
                  >
                    <PlusCircle className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('registerNewAccount')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/umrahoffices/dashboard/bus/manage`}
                    className={getLinkClasses(`/umrahoffices/dashboard/bus/manage`, "flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700")}
                  >
                    <Image className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('manageBusesAndPrices')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/umrahoffices/dashboard/bus/bookings`}
                    className={getLinkClasses(`/umrahoffices/dashboard/bus/bookings`, "flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700")}
                  >
                    <ClipboardList className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('bookingsAndCommissions')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/umrahoffices/dashboard/bus/packages`}
                    className={getLinkClasses(`/umrahoffices/dashboard/bus/packages`, "flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700")}
                  >
                    <Crown className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('premiumPackages')}</span>
                  </Link>
                </li>
               
              </ul>
            </li> */}
            
            {/* Documents & Gallery Section */}
            <li>
              <Link
                href={`/notifications`}
                className={getLinkClasses(`/notifications`, "flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group")}
              >
                <FileText className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="ms-3">{t('notifications')}</span>
              </Link>
            </li>
            
            <li>
              <Link
                href={`/umrahoffices/dashboard/chats`}
                className={getLinkClasses(`/umrahoffices/dashboard/chats`, "flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group")}
              >
                <PictureInPicture className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="ms-3">{t('chats')}</span>
              </Link>
            </li>
            
            {/* Profile link */}
            <li>
              <Link
                href={`/umrahoffices/dashboard/profile`}
                className={getLinkClasses(`/umrahoffices/dashboard/profile`, "flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group")}
              >
                <User className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="ms-3">{t('profile')}</span>
              </Link>
            </li>

            <li>
              <Link
                href={`/umrahoffices/dashboard/wallet`}
                className={getLinkClasses(`/umrahoffices/dashboard/wallet`, "flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group")}
              >
                <User className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="ms-3">{t('wallet')}</span>
              </Link>
            </li>

            {/* Settings Section */}
            <li>
              <button
                type="button"
                className="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                <Settings className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="flex-1 ms-3 text-right">{t('settings')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
              </button>
              <ul className={`${settingsOpen ? 'block' : 'hidden'} py-2 space-y-2`}>
                <li>
                  <Link
                    href={`/umrahoffices/dashboard/profile`}
                    className={getLinkClasses(`/umrahoffices/dashboard/profile`, "flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700")}
                  >
                    <User className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('profile')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/umrahoffices/dashboard/documents`}
                    className={getLinkClasses(`/umrahoffices/dashboard/documents`, "flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700")}
                  >
                    <FileText className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('documents')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/umrahoffices/dashboard/gallery`}
                    className={getLinkClasses(`/umrahoffices/dashboard/gallery`, "flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700")}
                  >
                    <PictureInPicture className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('gallery')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/umrahoffices/dashboard/api-tester`}
                    className={getLinkClasses(`/umrahoffices/dashboard/api-tester`, "flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700")}
                  >
                    <FileText className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>API Tester</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <SunMoon className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('changeTheme')}</span>
                  </button>
                </li>
                <li>
                  <div className="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                    <DropdownMenuRadiochanglang />
                  </div>
                </li>
              </ul>
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="flex w-full items-center p-2 text-red-600 rounded-lg dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <LogOut className="w-5 h-5" />
                <span className="ms-3">{t('logout')}</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
} 