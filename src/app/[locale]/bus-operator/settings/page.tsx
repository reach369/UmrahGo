'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Bell, Shield, Globe, Palette, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { updateSettings, fetchSettings } from '../redux/busOperatorSlice';

export default function BusOperatorSettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email_bookings: true,
      email_cancellations: true,
      email_payments: true,
      push_bookings: true,
      push_cancellations: true,
      push_payments: false,
      sms_bookings: false,
      sms_urgent: true,
    },
    privacy: {
      profile_visibility: 'public',
      show_statistics: true,
      show_reviews: true,
      allow_direct_contact: true,
    },
    business: {
      auto_confirm_bookings: false,
      require_advance_payment: true,
      cancellation_policy: 'flexible',
      refund_policy: 'standard',
    },
    system: {
      language: 'ar',
      timezone: 'Asia/Riyadh',
      currency: 'SAR',
      date_format: 'DD/MM/YYYY',
    }
  });

  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.busOperator);
  const t = useTranslations('BusOperatorDashboard');

  useEffect(() => {
    // dispatch(fetchSettings());
  }, [dispatch]);

  const handleSave = async () => {
    try {
      await dispatch(updateSettings(settings)).unwrap();
      // Show success message
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updatePrivacySetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const updateBusinessSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      business: {
        ...prev.business,
        [key]: value
      }
    }));
  };

  const updateSystemSetting = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      system: {
        ...prev.system,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground">
            {t('settings.subtitle')}
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading.settings}>
          <Save className="w-4 h-4 mr-2" />
          {t('common.save')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>{t('settings.notifications.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">إشعارات البريد الإلكتروني</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email_bookings">الحجوزات الجديدة</Label>
                  <Switch
                    id="email_bookings"
                    checked={settings.notifications.email_bookings}
                    onCheckedChange={(checked) => updateNotificationSetting('email_bookings', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email_cancellations">الإلغاءات</Label>
                  <Switch
                    id="email_cancellations"
                    checked={settings.notifications.email_cancellations}
                    onCheckedChange={(checked) => updateNotificationSetting('email_cancellations', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email_payments">المدفوعات</Label>
                  <Switch
                    id="email_payments"
                    checked={settings.notifications.email_payments}
                    onCheckedChange={(checked) => updateNotificationSetting('email_payments', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-3">الإشعارات الفورية</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push_bookings">الحجوزات الجديدة</Label>
                  <Switch
                    id="push_bookings"
                    checked={settings.notifications.push_bookings}
                    onCheckedChange={(checked) => updateNotificationSetting('push_bookings', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push_cancellations">الإلغاءات</Label>
                  <Switch
                    id="push_cancellations"
                    checked={settings.notifications.push_cancellations}
                    onCheckedChange={(checked) => updateNotificationSetting('push_cancellations', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push_payments">المدفوعات</Label>
                  <Switch
                    id="push_payments"
                    checked={settings.notifications.push_payments}
                    onCheckedChange={(checked) => updateNotificationSetting('push_payments', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-3">رسائل SMS</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms_bookings">الحجوزات الجديدة</Label>
                  <Switch
                    id="sms_bookings"
                    checked={settings.notifications.sms_bookings}
                    onCheckedChange={(checked) => updateNotificationSetting('sms_bookings', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms_urgent">الإشعارات العاجلة</Label>
                  <Switch
                    id="sms_urgent"
                    checked={settings.notifications.sms_urgent}
                    onCheckedChange={(checked) => updateNotificationSetting('sms_urgent', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>{t('settings.privacy.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profile_visibility">رؤية الملف الشخصي</Label>
              <Select
                value={settings.privacy.profile_visibility}
                onValueChange={(value) => updatePrivacySetting('profile_visibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">عام</SelectItem>
                  <SelectItem value="limited">محدود</SelectItem>
                  <SelectItem value="private">خاص</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_statistics">عرض الإحصائيات</Label>
              <Switch
                id="show_statistics"
                checked={settings.privacy.show_statistics}
                onCheckedChange={(checked) => updatePrivacySetting('show_statistics', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show_reviews">عرض التقييمات</Label>
              <Switch
                id="show_reviews"
                checked={settings.privacy.show_reviews}
                onCheckedChange={(checked) => updatePrivacySetting('show_reviews', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allow_direct_contact">السماح بالتواصل المباشر</Label>
              <Switch
                id="allow_direct_contact"
                checked={settings.privacy.allow_direct_contact}
                onCheckedChange={(checked) => updatePrivacySetting('allow_direct_contact', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>{t('settings.business.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto_confirm_bookings">تأكيد الحجوزات تلقائياً</Label>
              <Switch
                id="auto_confirm_bookings"
                checked={settings.business.auto_confirm_bookings}
                onCheckedChange={(checked) => updateBusinessSetting('auto_confirm_bookings', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="require_advance_payment">طلب دفعة مقدمة</Label>
              <Switch
                id="require_advance_payment"
                checked={settings.business.require_advance_payment}
                onCheckedChange={(checked) => updateBusinessSetting('require_advance_payment', checked)}
              />
            </div>

            <div>
              <Label htmlFor="cancellation_policy">سياسة الإلغاء</Label>
              <Select
                value={settings.business.cancellation_policy}
                onValueChange={(value) => updateBusinessSetting('cancellation_policy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">مرنة</SelectItem>
                  <SelectItem value="moderate">متوسطة</SelectItem>
                  <SelectItem value="strict">صارمة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="refund_policy">سياسة الاسترداد</Label>
              <Select
                value={settings.business.refund_policy}
                onValueChange={(value) => updateBusinessSetting('refund_policy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">قياسية</SelectItem>
                  <SelectItem value="generous">سخية</SelectItem>
                  <SelectItem value="strict">صارمة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>{t('settings.system.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">اللغة</Label>
              <Select
                value={settings.system.language}
                onValueChange={(value) => updateSystemSetting('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">المنطقة الزمنية</Label>
              <Select
                value={settings.system.timezone}
                onValueChange={(value) => updateSystemSetting('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                  <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                  <SelectItem value="Asia/Kuwait">الكويت (GMT+3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">العملة</Label>
              <Select
                value={settings.system.currency}
                onValueChange={(value) => updateSystemSetting('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                  <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                  <SelectItem value="KWD">دينار كويتي (KWD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date_format">تنسيق التاريخ</Label>
              <Select
                value={settings.system.date_format}
                onValueChange={(value) => updateSystemSetting('date_format', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">منطقة الخطر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h4 className="font-medium text-red-800">حذف الحساب</h4>
              <p className="text-sm text-red-600">حذف الحساب نهائياً مع جميع البيانات</p>
            </div>
            <Button variant="destructive">
              حذف الحساب
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 