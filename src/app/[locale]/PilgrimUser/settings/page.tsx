'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { userService } from '@/services/user.service';
import { notificationService } from '@/app/[locale]/PilgrimUser/services/notificationService';
import { Loader2, Save, Bell, Moon, Sun, Languages, Volume2 } from 'lucide-react';

// Form schema for notification settings
const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  bookingUpdates: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  newPackages: z.boolean().default(true),
});

// Form schema for appearance settings
const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  reduceAnimations: z.boolean().default(false),
  highContrast: z.boolean().default(false),
});

// Form schema for language settings
const languageFormSchema = z.object({
  language: z.enum(['ar', 'en']).default('ar'),
  rtl: z.boolean().default(true),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;
type LanguageFormValues = z.infer<typeof languageFormSchema>;

export default function SettingsPage() {
  const t = useTranslations();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { state } = useAuth();
  const { user } = state;

  const [activeTab, setActiveTab] = useState('notifications');
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingAppearance, setLoadingAppearance] = useState(false);
  const [loadingLanguage, setLoadingLanguage] = useState(false);

  // Notification settings form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema) as any,
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      bookingUpdates: true,
      marketingEmails: false,
      newPackages: true,
    }
  });

  // Appearance settings form
  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema) as any,
    defaultValues: {
      theme: (['light', 'dark', 'system'].includes(theme || '') ? theme : 'system') as 'light' | 'dark' | 'system',
      reduceAnimations: false,
      highContrast: false,
    }
  });


  // Language settings form
  const languageForm = useForm<LanguageFormValues>({
    resolver: zodResolver(languageFormSchema) as any,
    defaultValues: {
      language: 'ar',
      rtl: true,
    }
  });

  // Fetch user settings on mount
  useEffect(() => {
    if (user) {
      // Load notification settings
      const loadNotificationSettings = async () => {
        try {
          const settings = await notificationService.getNotificationSettings(user.id);
          notificationForm.reset({
            emailNotifications: settings?.email_notifications || true,
            pushNotifications: settings?.push_notifications || true,
            bookingUpdates: settings?.booking_updates || true,
            marketingEmails: settings?.marketing_emails || false,
            newPackages: settings?.new_packages || true,
          });
        } catch (error) {
          console.error('Failed to load notification settings:', error);
        }
      };

      // Load user preferences
      const loadUserPreferences = async () => {
        try {
          const preferences = await userService.getUserPreferences(user.id);
          
          // Update appearance form
          appearanceForm.reset({
            theme: preferences?.theme || theme as 'light' | 'dark' | 'system',
            reduceAnimations: preferences?.reduce_animations || false,
            highContrast: preferences?.high_contrast || false,
          });
          
          // Update language form
          languageForm.reset({
            language: (preferences?.language as 'ar' | 'en') || 'ar',
            rtl: preferences?.rtl !== undefined ? preferences.rtl : true,
          });
        } catch (error) {
          console.error('Failed to load user preferences:', error);
        }
      };

      loadNotificationSettings();
      loadUserPreferences();
    }
  }, [user, theme, notificationForm, appearanceForm, languageForm]);

  // Handle notification settings submit
  const onNotificationSubmit = async (data: NotificationFormValues) => {
    if (!user) return;
    
    setLoadingNotifications(true);
    try {
      await notificationService.updateNotificationSettings(user.id, {
        email_notifications: data.emailNotifications,
        push_notifications: data.pushNotifications,
        booking_updates: data.bookingUpdates,
        marketing_emails: data.marketingEmails,
        new_packages: data.newPackages,
      });
      
      toast({
        title: t('settings.notifications.success'),
        description: t('settings.notifications.successMsg'),
      });
    } catch (error) {
      toast({
        title: t('settings.notifications.error'),
        description: t('settings.notifications.errorMsg'),
        variant: 'destructive',
      });
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Handle appearance settings submit
  const onAppearanceSubmit = async (data: AppearanceFormValues) => {
    if (!user) return;
    
    setLoadingAppearance(true);
    try {
      // Set theme
      setTheme(data.theme);
      
      // Save preferences to API
      await userService.updateUserPreferences(user.id, {
        theme: data.theme,
        reduce_animations: data.reduceAnimations,
        high_contrast: data.highContrast,
      });
      
      toast({
        title: t('settings.appearance.success'),
        description: t('settings.appearance.successMsg'),
      });
    } catch (error) {
      toast({
        title: t('settings.appearance.error'),
        description: t('settings.appearance.errorMsg'),
        variant: 'destructive',
      });
    } finally {
      setLoadingAppearance(false);
    }
  };

  // Handle language settings submit
  const onLanguageSubmit = async (data: LanguageFormValues) => {
    if (!user) return;
    
    setLoadingLanguage(true);
    try {
      // Save preferences to API
      await userService.updateUserPreferences(user.id, {
        language: data.language,
        rtl: data.rtl,
      });
      
      toast({
        title: t('settings.language.success'),
        description: t('settings.language.successMsg'),
      });
      
      // Redirect to apply language change (after a short delay)
      setTimeout(() => {
        window.location.href = `/${data.language}/PilgrimUser/settings`;
      }, 1500);
    } catch (error) {
      toast({
        title: t('settings.language.error'),
        description: t('settings.language.errorMsg'),
        variant: 'destructive',
      });
      setLoadingLanguage(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title') || 'الإعدادات'}</h1>
          <p className="text-muted-foreground">
            {t('settings.description') || 'إدارة إعدادات الحساب والتفضيلات الشخصية'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>{t('settings.tabs.notifications') || 'الإشعارات'}</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>{t('settings.tabs.appearance') || 'المظهر'}</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              <span>{t('settings.tabs.language') || 'اللغة'}</span>
            </TabsTrigger>
          </TabsList>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notifications.title') || 'إعدادات الإشعارات'}</CardTitle>
                <CardDescription>
                  {t('settings.notifications.description') || 'تحكم في كيفية إرسال الإشعارات إليك'}
                </CardDescription>
              </CardHeader>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}>
                <CardContent className="space-y-4">
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">
                        {t('settings.notifications.emailNotifications') || 'إشعارات البريد الإلكتروني'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.emailNotificationsDescription') || 'تلقي الإشعارات عبر البريد الإلكتروني'}
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      {...notificationForm.register('emailNotifications')}
                      checked={notificationForm.watch('emailNotifications')}
                      onCheckedChange={(checked) => notificationForm.setValue('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="pushNotifications">
                        {t('settings.notifications.pushNotifications') || 'إشعارات الجوال'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.pushNotificationsDescription') || 'تلقي الإشعارات المباشرة على جهازك'}
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      {...notificationForm.register('pushNotifications')}
                      checked={notificationForm.watch('pushNotifications')}
                      onCheckedChange={(checked) => notificationForm.setValue('pushNotifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="bookingUpdates">
                        {t('settings.notifications.bookingUpdates') || 'تحديثات الحجوزات'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.bookingUpdatesDescription') || 'تلقي إشعارات عند تحديث حالة الحجوزات'}
                      </p>
                    </div>
                    <Switch
                      id="bookingUpdates"
                      {...notificationForm.register('bookingUpdates')}
                      checked={notificationForm.watch('bookingUpdates')}
                      onCheckedChange={(checked) => notificationForm.setValue('bookingUpdates', checked)}
                    />
                  </div>

                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketingEmails">
                        {t('settings.notifications.marketingEmails') || 'رسائل تسويقية'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.marketingEmailsDescription') || 'تلقي العروض والنشرات الإخبارية'}
                      </p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      {...notificationForm.register('marketingEmails')}
                      checked={notificationForm.watch('marketingEmails')}
                      onCheckedChange={(checked) => notificationForm.setValue('marketingEmails', checked)}
                    />
                  </div>

                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="newPackages">
                        {t('settings.notifications.newPackages') || 'باقات جديدة'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.notifications.newPackagesDescription') || 'تلقي إشعارات عند إضافة باقات جديدة'}
                      </p>
                    </div>
                    <Switch
                      id="newPackages"
                      {...notificationForm.register('newPackages')}
                      checked={notificationForm.watch('newPackages')}
                      onCheckedChange={(checked) => notificationForm.setValue('newPackages', checked)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loadingNotifications}>
                    {loadingNotifications && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    {t('settings.save') || 'حفظ التغييرات'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.appearance.title') || 'إعدادات المظهر'}</CardTitle>
                <CardDescription>
                  {t('settings.appearance.description') || 'تخصيص مظهر التطبيق حسب تفضيلاتك'}
                </CardDescription>
              </CardHeader>
              <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('settings.appearance.theme') || 'نمط العرض'}</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer ${
                          appearanceForm.watch('theme') === 'light'
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:border-muted'
                        }`}
                        onClick={() => appearanceForm.setValue('theme', 'light')}
                      >
                        <Sun className="mb-2 h-6 w-6" />
                        <span>{t('theme.light') || 'فاتح'}</span>
                      </div>
                      <div
                        className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer ${
                          appearanceForm.watch('theme') === 'dark'
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:border-muted'
                        }`}
                        onClick={() => appearanceForm.setValue('theme', 'dark')}
                      >
                        <Moon className="mb-2 h-6 w-6" />
                        <span>{t('theme.dark') || 'داكن'}</span>
                      </div>
                      <div
                        className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer ${
                          appearanceForm.watch('theme') === 'system'
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:border-muted'
                        }`}
                        onClick={() => appearanceForm.setValue('theme', 'system')}
                      >
                        <div className="mb-2 flex h-6 w-6">
                          <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                          <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </div>
                        <span>{t('theme.system') || 'تلقائي'}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="reduceAnimations">
                        {t('theme.reduceAnimations') || 'تقليل الحركة'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('theme.reduceAnimationsDescription') || 'تقليل الحركات والمؤثرات البصرية'}
                      </p>
                    </div>
                    <Switch
                      id="reduceAnimations"
                      {...appearanceForm.register('reduceAnimations')}
                      checked={appearanceForm.watch('reduceAnimations')}
                      onCheckedChange={(checked) => appearanceForm.setValue('reduceAnimations', checked)}
                    />
                  </div>

                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="highContrast">
                        {t('theme.highContrast') || 'تباين عالي'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('theme.highContrastDescription') || 'زيادة التباين لتحسين القراءة'}
                      </p>
                    </div>
                    <Switch
                      id="highContrast"
                      {...appearanceForm.register('highContrast')}
                      checked={appearanceForm.watch('highContrast')}
                      onCheckedChange={(checked) => appearanceForm.setValue('highContrast', checked)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loadingAppearance}>
                    {loadingAppearance && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    {t('settings.save') || 'حفظ التغييرات'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* Language Settings */}
          <TabsContent value="language" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.language.title') || 'إعدادات اللغة'}</CardTitle>
                <CardDescription>
                  {t('settings.language.description') || 'تغيير لغة التطبيق واتجاه العرض'}
                </CardDescription>
              </CardHeader>
              <form onSubmit={languageForm.handleSubmit(onLanguageSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('settings.language.selectLanguage') || 'اختر اللغة'}</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer ${
                          languageForm.watch('language') === 'ar'
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:border-muted'
                        }`}
                        onClick={() => {
                          languageForm.setValue('language', 'ar');
                          languageForm.setValue('rtl', true);
                        }}
                      >
                        <span className="text-2xl mb-2">🇸🇦</span>
                        <span>العربية</span>
                      </div>
                      <div
                        className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer ${
                          languageForm.watch('language') === 'en'
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:border-muted'
                        }`}
                        onClick={() => {
                          languageForm.setValue('language', 'en');
                          languageForm.setValue('rtl', false);
                        }}
                      >
                        <span className="text-2xl mb-2">🇬🇧</span>
                        <span>English</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="rtl">
                        {t('settings.language.rtl') || 'عرض من اليمين لليسار (RTL)'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.language.rtlDescription') || 'عرض المحتوى من اليمين إلى اليسار'}
                      </p>
                    </div>
                    <Switch
                      id="rtl"
                      {...languageForm.register('rtl')}
                      checked={languageForm.watch('rtl')}
                      onCheckedChange={(checked) => languageForm.setValue('rtl', checked)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loadingLanguage}>
                    {loadingLanguage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    {t('settings.save') || 'حفظ التغييرات'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 