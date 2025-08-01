'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';

const NotificationBanner: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  // استخدام try-catch لمنع الأخطاء إذا لم يكن السياق متاحًا
  let t: any;
  try {
    t = useTranslations();
  } catch (error) {
    // إذا فشل استخدام useTranslations، استخدم دالة بديلة
    t = (key: string) => {
      const translations: Record<string, string> = {
        'common.close': 'إغلاق',
        // إضافة المزيد من الترجمات الافتراضية حسب الحاجة
      };
      return translations[key] || key;
    };
  }

  useEffect(() => {
    const checkNotificationStatus = () => {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
      }

      const currentPermission = Notification.permission;
      setPermission(currentPermission);

      const dismissed = localStorage.getItem('notification_banner_dismissed');
      const dialogShown = localStorage.getItem('notification_dialog_shown');
      
      // إظهار المودل أولاً إذا لم يتم عرضه من قبل
      if (currentPermission === 'default' && !dialogShown) {
        setTimeout(() => {
          setShowDialog(true);
          localStorage.setItem('notification_dialog_shown', 'true');
        }, 3000); // انتظار 3 ثواني قبل إظهار المودل
      } else if (currentPermission === 'default' && !dismissed) {
        setShowBanner(true);
      }
    };

    checkNotificationStatus();
  }, []);

  const handleEnableNotifications = async () => {
    try {
      setIsLoading(true);

      // طلب إذن الإشعارات
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // محاولة الحصول على FCM token
        try {
          const response = await fetch('/api/fcm/get-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // إرسال token إلى الخادم
            await fetch('/api/fcm/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                token: data.token,
                device: getDeviceInfo(),
                browser: getBrowserInfo(),
                timestamp: new Date().toISOString()
              })
            });
            
            // إظهار إشعار تجريبي
            new Notification('تم تفعيل الإشعارات! 🎉', {
              body: 'ستصلك الآن إشعارات حول طلبات حجز العمرة والتحديثات المهمة',
              icon: '/icons/icon-192x192.png'
            });
          }
        } catch (error) {
          console.warn('⚠️ FCM token handling failed:', error);
        }
        
        setPermission('granted');
        setShowDialog(false);
        setShowBanner(false);
        localStorage.setItem('notifications_enabled', 'true');
      } else {
        setPermission('denied');
        setShowDialog(false);
        setShowBanner(false);
        localStorage.setItem('notification_banner_dismissed', 'true');
      }
      
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowDialog(false);
    localStorage.setItem('notification_banner_dismissed', 'true');
  };

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
    
    return {
      type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
      userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height
      }
    };
  };

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    
    if (userAgent.indexOf('Chrome') > -1) browserName = 'Chrome';
    else if (userAgent.indexOf('Safari') > -1) browserName = 'Safari';
    else if (userAgent.indexOf('Firefox') > -1) browserName = 'Firefox';
    else if (userAgent.indexOf('Edge') > -1) browserName = 'Edge';
    
    return {
      name: browserName,
      language: navigator.language,
      platform: navigator.platform
    };
  };

  const handleRetryPermission = () => {
    // إظهار مودل مع تعليمات مفصلة
    setShowDialog(true);
  };

  // عدم إظهار أي شيء إذا لم يكن هناك دعم للإشعارات
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  return (
    <>
      {/* المودل المنبثق */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                permission === 'denied' 
                  ? "bg-red-100 dark:bg-red-900/20" 
                  : "bg-blue-100 dark:bg-blue-900/20"
              )}>
                {permission === 'denied' ? (
                  <BellOff className="h-6 w-6 text-red-600 dark:text-red-400" />
                ) : (
                  <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                )}
              </div>
              <div>
                <DialogTitle>
                  {permission === 'denied' 
                    ? 'الإشعارات معطلة' 
                    : 'تفعيل الإشعارات'
                  }
                </DialogTitle>
                <DialogDescription>
                  {permission === 'denied'
                    ? 'لن تتمكن من تلقي إشعارات حول حجوزاتك'
                    : 'احصل على تحديثات فورية عن حالة حجوزاتك'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {permission === 'denied' ? (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium mb-2">لتفعيل الإشعارات:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>انقر على أيقونة القفل في شريط العنوان</li>
                      <li>ابحث عن "الإشعارات" واختر "السماح"</li>
                      <li>أعد تحميل الصفحة</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">تحديثات فورية</p>
                    <p className="text-sm text-muted-foreground">
                      احصل على إشعارات لحظية عند تأكيد أو إلغاء الحجوزات
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">عروض حصرية</p>
                    <p className="text-sm text-muted-foreground">
                      كن أول من يعرف عن العروض الخاصة والخصومات
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">تذكيرات مهمة</p>
                    <p className="text-sm text-muted-foreground">
                      لا تفوت مواعيد السفر والفعاليات المهمة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {permission === 'denied' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  className="flex-1"
                >
                  فهمت
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  disabled={isLoading}
                  className="flex-1"
                >
                  ليس الآن
                </Button>
                <Button
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      جاري التفعيل...
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      تفعيل الإشعارات
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* البانر العلوي (كبديل للمودل) */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
          >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
                  <Bell size={24} className="text-yellow-300 animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                فعّل الإشعارات للحصول على آخر التحديثات
              </p>
              <p className="text-xs text-blue-100 mt-1">
                احصل على إشعارات فورية عن حالة حجوزاتك وأهم العروض
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
              onClick={handleEnableNotifications}
              disabled={isLoading}
                    size="sm"
                    className=" hover:bg-gray-100 text-blue-700 font-medium"
            >
              {isLoading ? (
                <>
                        <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin mr-2" />
                        جاري التفعيل...
                </>
              ) : (
                <>
                        <Bell size={16} className="mr-2" />
                        تفعيل الإشعارات
                </>
              )}
                  </Button>
            
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors duration-200"
              aria-label={t('common.close') || 'إغلاق'}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationBanner; 