'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useAuthStore } from '../hooks/useAuthStore';
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
  MessageCircle
} from 'lucide-react';
import DropdownMenuRadiochanglang from '@/components/ui/changlangouge';

export default function Sidebar() {
  const t = useTranslations('Navigation');
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [officeMenuOpen, setOfficeMenuOpen] = useState(true);
  const [busMenuOpen, setBusMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
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
        <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
          {/* Logo */}
          <div className="flex items-center mb-5 p-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">{t('umrahOffices')}</span>
          </div>

          <ul className="space-y-2 font-medium">
            <li>
              <Link
                href="/umrah-offices/dashboard"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
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
                    href="/umrah-offices/dashboard/campaigns"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <CalendarDays className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('campaigns')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/umrah-offices/dashboard/bookings"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <BookOpen className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('bookings')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/umrah-offices/dashboard/payments"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <CreditCard className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('payments')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/umrah-offices/dashboard/packages"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <Package className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('packages')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/umrah-offices/dashboard/transportation-operators/chat"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <Bus className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('busOperators')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/umrah-offices/dashboard/add-pilgrim"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <UserPlus className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('addPilgrim')}</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Bus Management Section */}
            <li>
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
                    href="/umrah-offices/dashboard/bus/register"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <PlusCircle className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('registerNewAccount')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/umrah-offices/dashboard/bus/manage"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <Image className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('manageBusesAndPrices')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/umrah-offices/dashboard/bus/bookings"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <ClipboardList className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('bookingsAndCommissions')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/umrah-offices/dashboard/bus/packages"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <Crown className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('premiumPackages')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/umrah-offices/dashboard/bus/chat"
                    className="flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white ml-2" />
                    <span>{t('chats')}</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center w-full p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <Settings className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                <span className="flex-1 ms-3 text-right">{t('settings')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
              </button>
              {settingsOpen && (
                <ul className="py-2 space-y-2">
                  <li>
                    <button
                      onClick={toggleTheme}
                      className="flex w-full items-center p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                      <SunMoon className="w-5 h-5 ml-2" />
                      {t('changeTheme')}
                    </button>
                  </li>
                  <li>
                    <div className="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">
                      <DropdownMenuRadiochanglang />
                    </div>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <button
                onClick={logout}
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