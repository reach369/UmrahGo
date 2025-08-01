'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CalendarDays, 
  MapPin, 
  Star, 
  Clock,
  BookOpen,
  Heart,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStatsProps {
  userId?: string;
}

interface UserStats {
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;
  favoriteOffices: number;
  totalSpent: number;
  averageRating: number;
  joinDate: string;
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  const { state: authState } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!authState.user?.id && !userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Simulate API call for now - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockStats: UserStats = {
          totalBookings: 3,
          completedBookings: 2,
          upcomingBookings: 1,
          favoriteOffices: 5,
          totalSpent: 12500,
          averageRating: 4.8,
          joinDate: '2024-01-15'
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        // Set default stats on error
        setStats({
          totalBookings: 0,
          completedBookings: 0,
          upcomingBookings: 0,
          favoriteOffices: 0,
          totalSpent: 0,
          averageRating: 0,
          joinDate: new Date().toISOString().split('T')[0]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, [authState.user?.id, userId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'إجمالي الحجوزات',
      value: stats.totalBookings,
      icon: BookOpen,
      description: `${stats.completedBookings} مكتملة، ${stats.upcomingBookings} قادمة`,
      color: 'text-blue-600'
    },
    {
      title: 'المبلغ المنفق',
      value: `${stats.totalSpent.toLocaleString()} ريال`,
      icon: CalendarDays,
      description: 'إجمالي المبالغ المدفوعة',
      color: 'text-green-600'
    },
    {
      title: 'المكاتب المفضلة',
      value: stats.favoriteOffices,
      icon: Heart,
      description: 'المكاتب المحفوظة في المفضلة',
      color: 'text-red-600'
    },
    {
      title: 'متوسط التقييم',
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-',
      icon: Star,
      description: 'تقييمك للخدمات المحجوزة',
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 