'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Provider } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { 
  Calendar, 
  Package, 
  Building, 
  Bell, 
  User, 
  Star, 
  TrendingUp, 
  CreditCard, 
  MapPin, 
  Clock, 
  Award, 
  BookOpen,
  MessageCircle,
  Shield,
  Globe,
  Heart,
  ArrowRight,
  Plus,
  Eye,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  InfoIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { store } from './redux/store';
import { DashboardStats } from './components/DashboardStats';
import { useUnifiedAuth } from '@/providers/AuthProvider';
import { fetchUserProfile } from './services/userService';
import { fetchUserBookings } from './services/bookingService';
import { getNotifications, getUnreadCount as getNotificationUnreadCount } from './services/notificationService';
import { getConversations, getUnreadCount as getChatUnreadCount } from './services/chatService';
import { fetchOffices, getFeaturedOffices } from './services/officesService';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth.service';

interface Office {
  id: string | number;
  name: string;
  rating: number;
  city: string;
  image?: string;
  logo?: string;
  packages_count?: number;
  verified?: boolean;
}

interface QuickActionCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgColor: string;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface DashboardData {
  bookings_count: number;
  active_bookings: number;
  completed_bookings: number;
  total_spent: string;
  points: number;
  points_change: number;
  favorite_offices: number;
  unread_notifications: number;
  unread_messages: number;
}

// Create a fallback loading component
const PageLoadingFallback = () => (
  <div className="flex flex-col space-y-6 p-6">
    <div className="w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
      ))}
    </div>
  </div>
);

// Create an error boundary component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Caught error:', event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">حدث خطأ أثناء تحميل البيانات</h2>
        <p className="mt-2 text-red-600 dark:text-red-300">يرجى تحديث الصفحة وإعادة المحاولة</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          تحديث الصفحة
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

// Main component wrapped in error handling
function PilgrimUserPageContent() {
  const { data: session } = useSession();
  const { user: authUser } = useUnifiedAuth();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [topRatedOffices, setTopRatedOffices] = useState<Office[]>([]);
  const [isTopRatedLoading, setIsTopRatedLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isUserProfileLoading, setIsUserProfileLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);

  // Use user data from either source
  const user = session?.user || authUser;

  // Get token from centralized auth service
  const getToken = () => {
    return getAuthToken();
  };

  useEffect(() => {
    setHasMounted(true);
    
    const loadDashboardData = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.error('Authentication token not found');
          toast.error(t('pilgrim.auth.token_not_found'));
          return;
        }

        // Load user profile with proper error handling
        setIsUserProfileLoading(true);
        try {
          const profileResponse = await fetchUserProfile();
          if (profileResponse.status && profileResponse.data) {
            setUserProfile(profileResponse.data);
          }
        } catch (err) {
          console.error('Error loading profile:', err);
          // Don't show toast for this error to avoid multiple notifications
        } finally {
          setIsUserProfileLoading(false);
        }

        // Fetch dashboard data from bookings with proper error handling
        setIsDashboardLoading(true);
        try {
          const bookingsResponse = await fetchUserBookings({
            per_page: 10,
            page: 1
          });
          
          if (bookingsResponse.status && bookingsResponse.data) {
            // Check if bookingsResponse.data is an array before using array methods
            // Ensure bookingsResponse.data is an array, otherwise default to empty array
            // Ensure bookingsResponse.data is an array, otherwise default to empty array
            let bookingsData: any[] = [];
            if (Array.isArray(bookingsResponse.data)) {
              bookingsData = bookingsResponse.data;
            } else if (
              bookingsResponse.data &&
              Array.isArray((bookingsResponse.data as any).data)
            ) {
              bookingsData = (bookingsResponse.data as any).data;
            }

            // Calculate dashboard data from bookings
            const activeBookings = bookingsData.filter((b: any) => b && b.status === 'confirmed').length;
            const completedBookings = bookingsData.filter((b: any) => b && b.status === 'completed').length;
            const totalSpent = bookingsData.reduce((sum, b) => sum + parseFloat(b.total_price || '0'), 0).toFixed(2);
            
            // Get unread counts with better error handling
            let unreadNotifications = 0;
            let unreadMessages = 0;
            
            try {
              try {
                unreadNotifications = await getNotificationUnreadCount(token);
              } catch (error: any) {
                console.warn('Error fetching unread notification count, using default value:', error.message || error);
                // Silently fallback to 0 without showing errors to the user
                unreadNotifications = 0;
              }
            
              try {
                unreadMessages = await getChatUnreadCount(token);
              } catch (error: any) {
                console.warn('Error fetching unread chat count, using default value:', error.message || error);
                // Silently fallback to 0 without showing errors to the user
                unreadMessages = 0;
              }
            } catch (error) {
              // Catch-all for any unexpected errors in the notification count logic
              console.warn('Unexpected error in notification count processing:', error);
            }
            
            setDashboardData({
              bookings_count: bookingsData.length,
              active_bookings: activeBookings,
              completed_bookings: completedBookings,
              total_spent: totalSpent,
              points: Math.floor(parseFloat(totalSpent) / 100), // Calculate points based on spending
              points_change: 5,
              favorite_offices: 3,
              unread_notifications: unreadNotifications,
              unread_messages: unreadMessages
            });
          }
        } catch (err) {
          console.error('Error loading booking data:', err);
          // Don't show toast here to avoid multiple error notifications
        } finally {
          setIsDashboardLoading(false);
        }

        // Fetch top rated offices
        try {
          setIsTopRatedLoading(true);
          const officesResponse = await fetchOffices('sort=rating&featured=1&limit=5');
          if (officesResponse && officesResponse.length > 0) {
            setTopRatedOffices(officesResponse.map(office => ({
              id: office.id,
              name: office.name,
              rating: typeof office.rating === 'number' ? office.rating : 0,
              city: office.city || '',
              image: office.logo,
              logo: office.logo,
              verified: office.verification_status === 'verified'
            })));
          }
        } catch (err) {
          console.error('خطأ في تحميل المكاتب ذات التقييم العالي:', err);
        } finally {
          setIsTopRatedLoading(false);
        }

        // Fetch recent notifications
        try {
          setIsNotificationsLoading(true);
          const notificationsResponse = await getNotifications(token, {
            per_page: 5,
            page: 1
          });
          
          if (notificationsResponse.status && notificationsResponse.data) {
            setNotifications(notificationsResponse.data);
          }
        } catch (err) {
          console.error('خطأ في تحميل الإشعارات:', err);
        } finally {
          setIsNotificationsLoading(false);
        }

        // Fetch recent conversations
        try {
          setIsConversationsLoading(true);
          const conversationsResponse = await getConversations(token);
          
          if (conversationsResponse && conversationsResponse.success && conversationsResponse.data) {
            setConversations(conversationsResponse.data.slice(0, 3));
          }
        } catch (err) {
          console.error('خطأ في تحميل المحادثات:', err);
        } finally {
          setIsConversationsLoading(false);
        }
      } catch (err) {
        console.error('خطأ في تحميل بيانات لوحة التحكم:', err);
        toast.error('حدث خطأ أثناء تحميل بيانات لوحة التحكم');
      }
    };

    if (hasMounted) {
      loadDashboardData();
    }
  }, [hasMounted]);

  const quickActions: QuickActionCard[] = [
    {
      title: t('pilgrim.dashboard.explore_packages'),
      description: t('pilgrim.dashboard.explore_packages_desc'),
      icon: Package,
      href: `/PilgrimUser/packages`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: t('pilgrim.dashboard.new_booking'),
      description: t('pilgrim.dashboard.new_booking_desc'),
      icon: Plus,
      href: `/PilgrimUser/booking`,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: t('pilgrim.dashboard.umrah_offices'),
      description: t('pilgrim.dashboard.umrah_offices_desc'),
      icon: Building,
      href: `/PilgrimUser/offices`,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      title: t('pilgrim.dashboard.messages'),
      description: t('pilgrim.dashboard.messages_desc'),
      icon: MessageCircle,
      href: `/PilgrimUser/chat`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  const getStatsFromDashboard = (): StatCard[] => {
    if (!dashboardData) return [];

    return [
      {
        title: t('pilgrim.dashboard.active_bookings'),
        value: dashboardData.active_bookings.toString(),
        change: '+2 منذ آخر شهر',
        trend: 'up',
        icon: Calendar,
        color: 'text-blue-600'
      },
      {
        title: t('pilgrim.dashboard.completed_trips'),
        value: dashboardData.completed_bookings.toString(),
        change: '+1 منذ آخر شهر',
        trend: 'up',
        icon: CheckCircle,
        color: 'text-green-600'
      },
      {
        title: t('pilgrim.dashboard.total_spent'),
        value: `${dashboardData.total_spent} SAR`,
        change: '+10% منذ آخر شهر',
        trend: 'up',
        icon: DollarSign,
        color: 'text-amber-600'
      },
      {
        title: t('pilgrim.dashboard.reward_points'),
        value: dashboardData.points.toString(),
        change: `+${dashboardData.points_change} نقاط جديدة`,
        trend: 'up',
        icon: Award,
        color: 'text-purple-600'
      }
    ];
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return t('time.just_now');
    } else if (diffMinutes < 60) {
      return t('time.minutes_ago', { minutes: diffMinutes });
    } else if (diffMinutes < 24 * 60) {
      const hours = Math.floor(diffMinutes / 60);
      return t('time.hours_ago', { hours });
    } else {
      const days = Math.floor(diffMinutes / (24 * 60));
      return t('time.days_ago', { days });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'chat':
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      case 'announcement':
        return <Bell className="h-5 w-5 text-amber-500" />;
      default:
        return <InfoIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!hasMounted) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t('pilgrim.dashboard.welcome')}{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('pilgrim.dashboard.welcome_subtitle')}
          </p>
        </div>
        <Button asChild>
          <Link href={`/PilgrimUser/booking`}>
            {t('pilgrim.dashboard.new_booking_button')}
            <Plus className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isDashboardLoading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))
        ) : (
          getStatsFromDashboard().map((stat, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.color.replace('text', 'bg')}/10`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center mt-1 text-xs">
                  {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
                  {stat.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 mr-1 transform rotate-180" />}
                  <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-bold mt-4">{t('pilgrim.dashboard.quick_actions')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, i) => (
          <Link key={i} href={action.href} className="block">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Card className="h-full transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className={`p-3 rounded-full ${action.bgColor} w-12 h-12 flex items-center justify-center mb-4`}>
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">
                    {action.description}
                  </p>
                  <div className="flex justify-end mt-4">
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Notifications */}
        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>{t('pilgrim.dashboard.recent_notifications')}</CardTitle>
              <Badge variant="outline">
                {dashboardData?.unread_notifications || 0} {t('pilgrim.dashboard.unread')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            {isNotificationsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.map((notification, i) => (
                  <div 
                    key={i}
                    className={`flex items-start gap-4 p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                      notification.status === 'unread' ? 'bg-gray-50 dark:bg-gray-800/70' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{notification.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatNotificationTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-3 px-3">
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href={`/PilgrimUser/notifications`}>
                      {t('pilgrim.dashboard.view_all_notifications')}
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-gray-500 dark:text-gray-400">
                  {t('pilgrim.dashboard.no_notifications')}
                </h3>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>{t('pilgrim.dashboard.recent_messages')}</CardTitle>
              <Badge variant="outline">
                {dashboardData?.unread_messages || 0} {t('pilgrim.dashboard.unread')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            {isConversationsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations && conversations.length > 0 ? (
              <div className="space-y-1">
                {conversations.map((chat, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <Avatar>
                      <AvatarImage 
                        src={chat.participants[0]?.avatar || ''} 
                        alt={chat.participants[0]?.name || 'User'} 
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70">
                        {chat.participants[0]?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{chat.title || chat.participants[0]?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {chat.last_message?.content || t('pilgrim.dashboard.start_conversation')}
                      </p>
                    </div>
                    {chat.unread_count > 0 && (
                      <Badge variant="secondary">{chat.unread_count}</Badge>
                    )}
                  </div>
                ))}
                <div className="pt-3 px-3">
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href={`/PilgrimUser/chat`}>
                      {t('pilgrim.dashboard.view_all_messages')}
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-gray-500 dark:text-gray-400">
                  {t('pilgrim.dashboard.no_messages')}
                </h3>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Rated Offices */}
        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle>{t('pilgrim.dashboard.top_rated_offices')}</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            {isTopRatedLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-14 w-14 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topRatedOffices && topRatedOffices.length > 0 ? (
              <div className="space-y-1">
                {topRatedOffices.map((office, i) => (
                  <Link 
                    key={i} 
                    href={`/umrah-offices/${office.id}`}
                    className="block"
                  >
                    <div className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {office.logo ? (
                          <img src={office.logo} alt={office.name} className="h-full w-full object-cover" />
                        ) : (
                          <Building className="h-8 w-8 text-gray-400" />
                        )}
                        {office.verified && (
                          <div className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-tl-lg">
                            <Shield className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{office.name}</p>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-amber-500 mr-1" />
                            <span className="text-xs">{office.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {office.city}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="pt-3 px-3">
                  <Button variant="ghost" size="sm" asChild className="w-full">
                    <Link href={`/PilgrimUser/offices`}>
                      {t('pilgrim.dashboard.view_all_offices')}
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <Building className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="text-gray-500 dark:text-gray-400">
                  {t('pilgrim.dashboard.no_offices')}
                </h3>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Export the wrapped component with error handling
export default function PilgrimUserPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoadingFallback />}>
        <PilgrimUserPageContent />
      </Suspense>
    </ErrorBoundary>
  );
} 