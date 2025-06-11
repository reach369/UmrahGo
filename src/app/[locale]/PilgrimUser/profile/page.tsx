'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth.service';
import BookingHistory from '../components/BookingHistory';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // استرجاع بيانات المستخدم من localStorage عند تحميل الصفحة
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // محاولة استرجاع بيانات المستخدم من localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } else {
          // إذا لم تكن البيانات موجودة، حاول الحصول عليها من الخادم
          try {
            const response = await authService.getCurrentUser();
            if (response.data?.user) {
              setUser(response.data.user);
            }
          } catch (error) {
            console.error('فشل في الحصول على بيانات المستخدم من API:', error);
          }
        }
      } catch (error) {
        console.error('فشل في استرجاع بيانات المستخدم:', error);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في استرجاع بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // إذا لم يتم العثور على بيانات المستخدم
  if (!user) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">لم يتم العثور على بيانات المستخدم</h2>
        <p className="mb-4">يرجى تسجيل الدخول لعرض الملف الشخصي</p>
        <Button asChild>
          <a href="/auth/login">تسجيل الدخول</a>
        </Button>
      </div>
    );
  }

  // تحويل حالة المستخدم إلى نص عربي
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'pending': return 'قيد المراجعة';
      case 'suspended': 
      case 'blocked': 
        return 'معلق';
      default: return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">الملف الشخصي</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* بطاقة المعلومات الشخصية */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                {(user.avatar || user.profile_photo) ? (
                  <AvatarImage 
                    src={user.avatar || (user.profile_photo || '')} 
                    alt={user.name} 
                  />
                ) : (
                  <AvatarFallback className="text-lg">{user.name?.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <p className="text-muted-foreground">
                {user.roles && user.roles.length > 0 ? user.roles[0].name : 'معتمر'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">حالة الحساب</p>
                  <p className="font-medium">
                    {getStatusText(user.status)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الانضمام</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* بطاقة معلومات الاتصال */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الاتصال</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-medium">{user.email}</p>
                    {user.email_verified_at && (
                      <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                        موثق
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium">{user.phone || 'غير محدد'}</p>
                  </div>
                </div>

                {user.address && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">العنوان</p>
                    <p className="font-medium">{user.address}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">اللغة المفضلة</p>
                  <p className="font-medium">
                    {user.preferred_language === 'ar' ? 'العربية' : 
                     user.preferred_language === 'en' ? 'الإنجليزية' : 
                     'غير محدد'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button 
              className="mr-2" 
              variant="outline" 
              onClick={() => router.push('/PilgrimUser/profile/edit')}
            >
              تعديل البيانات
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => router.push('/PilgrimUser/profile/change-password')}
            >
              تغيير كلمة المرور
            </Button>
          </div>
        </div>
      </div>

      {/* سجل الحجوزات */}
      <div className="mt-8">
        <BookingHistory userId={user.id} />
      </div>
    </div>
  );
} 