'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import UnifiedHeader from '@/components/ui/unified-header';
import Sidebar from '@/components/ui/sidebar';
import { NotificationSystem } from './components/NotificationSystem';
import { Separator } from '@/components/ui/separator';
import { UserDetails } from '@/types/auth.types';

interface PilgrimLayoutProps {
  children: React.ReactNode;
}

export default function PilgrimLayout({ children }: PilgrimLayoutProps) {
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  
  useEffect(() => {
    // استرجاع بيانات المستخدم من localStorage عند تحميل الصفحة
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('فشل في استرجاع بيانات المستخدم:', error);
      }
    }
    
    // التحقق من حجم الشاشة
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader isDashboard={true} showNotifications={true} />
      
      <div className="flex">
        {/* Sidebar */}
        {!isMobileView && <Sidebar locale={locale} />}
        
        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-6">
          {user?.id && <NotificationSystem userId={user.id.toString()} />}
        {children}
      </main>
      </div>
      
      <Separator className="my-6" />
      
      <footer className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} UmrahGo - جميع الحقوق محفوظة
      </footer>
    </div>
  );
} 