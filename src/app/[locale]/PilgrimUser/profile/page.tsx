'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Flag, 
  Upload, 
  Edit2, 
  Save, 
  Clock, 
  Globe, 
  Lock, 
  Bell, 
  ArrowUpRight 
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
    
// Context & Services
import { useUnifiedAuth } from '@/providers/AuthProvider';
import { fetchUserProfile, updateUserProfile, changeUserPassword, uploadProfilePhoto, requestServiceUpgrade } from '../services/userService';
import { fetchUserBookings } from '../services/bookingService';

const ProfilePage = () => {
  // Hooks
  const t = useTranslations('profile');
  const commonT = useTranslations('Common');
  const { toast } = useToast();
  const { user: authUser } = useUnifiedAuth();
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = String(params?.locale || 'ar');

  // States
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  // Form States
  const [userProfile, setUserProfile] = useState<any>({
    name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    address: '',
    city: '',
    country: '',
    preferred_language: locale,
    timezone: '',
    notification_preferences: {
      email: true,
      push: true,
      sms: false,
      types: {
        chat: true,
        system: true,
        booking: true,
        payment: true,
        support: true
      }
    },
    request_upgrade: '0'
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Fetch user data
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchUserProfile();
        if (response.status && response.data) {
          setUserProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: t('errors.loadError'),
          description: t('errors.loadErrorDescription'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }

      // Fetch recent bookings
      setIsBookingsLoading(true);
      try {
        const bookingsResponse = await fetchUserBookings({ 
          per_page: 5 
        });
        
        if (bookingsResponse.status && Array.isArray(bookingsResponse.data)) {
          setRecentBookings(bookingsResponse.data as any[]);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsBookingsLoading(false);
      }
    };

    loadUserData();
  }, [locale, toast, t]);

  // Avatar file change handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      
      // Upload immediately
      handleAvatarUpload(e.target.files[0]);
    }
  };

  // Upload avatar
  const handleAvatarUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const response = await uploadProfilePhoto(file);
      if (response.status && response.data) {
        setUserProfile(prev => ({
          ...prev,
          profile_photo: response.data.profile_photo,
          avatar: response.data.avatar
        }));
        
        toast({
          title: t('success'),
          description: t('photoSuccess'),
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: t('errors.error'),
        description: t('errors.photoError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setAvatarFile(null);
    }
  };

  // Profile update handler
  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await updateUserProfile(userProfile);
      if (response.status && response.data) {
        setUserProfile(response.data);
        setIsEditing(false);
        
        toast({
          title: t('success'),
          description: t('updateSuccess'),
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: t('errors.error'),
        description: t('errors.updateError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: t('errors.error'),
        description: t('errors.passwordMismatch'),
        variant: "destructive",
      });
      return;
    }

    setIsPasswordLoading(true);
    try {
      await changeUserPassword(passwordData);
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      toast({
        title: t('success'),
        description: t('passwordSuccess'),
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: t('errors.error'),
        description: t('errors.passwordError'),
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Start service upgrade request
  const handleServiceUpgradeRequest = () => {
    router.push(`/${locale}/PilgrimUser/profile/upgrade`);
  };

  // User display info
  const user = userProfile || authUser || session?.user;
  const avatarUrl = userProfile?.avatar || userProfile?.profile_photo || user?.image;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const dateLocale = locale === 'ar' ? ar : enUS;
  const hasUpgradeRequest = userProfile?.request_upgrade === '1';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('personalInfo')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit2 className="h-4 w-4" />
              {t('edit')}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
                {t('cancel')}
              </Button>
              <Button onClick={handleProfileUpdate} className="gap-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('save')}
              </Button>
            </>
          )}

          {/* Service Provider Upgrade Button */}
          {!hasUpgradeRequest && (
            <Button 
              onClick={handleServiceUpgradeRequest} 
              variant="outline" 
              className="gap-2 bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 text-blue-600 border-blue-200"
            >
              <ArrowUpRight className="h-4 w-4" />
              {t('becomeServiceProvider')}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Left Column - User Info Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center pb-4 relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || ''} alt={user?.name || t('user')} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 right-1/3">
                <label 
                  htmlFor="avatar-upload"
                  className="cursor-pointer rounded-full bg-primary text-primary-foreground p-1 hover:bg-primary/90"
                >
                  <Upload className="h-4 w-4" />
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <CardTitle>{user?.name || t('user')}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{userProfile?.phone || t('fields.phone')}</span>
            </div>
            {userProfile?.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{userProfile.address}</span>
              </div>
            )}
            {userProfile?.country && (
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <span>{userProfile.country}</span>
              </div>
            )}
            {/* Show role/status */}
            <div className="pt-2">
              {userProfile?.roles && userProfile.roles.length > 0 && (
                <Badge variant="outline" className="mr-2">
                  {userProfile.roles[0].name === 'user' 
                    ? t('roles.user')
                    : userProfile.roles[0].description || userProfile.roles[0].name}
                </Badge>
              )}
              <Badge variant={userProfile?.status === 'active' ? 'default' : 'secondary'}>
                {userProfile?.status === 'active' 
                  ? t('status.active')
                  : t('status.inactive')}
              </Badge>
            </div>

            {/* Upgrade Request Status */}
            {hasUpgradeRequest && (
              <Alert className="mt-4">
                <AlertTitle>
                  {t('serviceUpgrade.title')}
                </AlertTitle>
                <AlertDescription>
                  {t('serviceUpgrade.pendingRequest')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Main Content Tabs */}
        <div className="md:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">{t('personalInfo')}</TabsTrigger>
              <TabsTrigger value="account">{t('accountInfo')}</TabsTrigger>
              <TabsTrigger value="password">{t('changePassword')}</TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>{t('personalInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('fields.name')}</Label>
                      <Input
                        id="name"
                        value={userProfile?.name || ''}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('fields.email')}</Label>
                      <Input
                        id="email"
                        value={userProfile?.email || ''}
                        onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                        disabled={true}
                        className="bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">{t('fields.emailReadOnly')}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('fields.phone')}</Label>
                      <Input
                        id="phone"
                        value={userProfile?.phone || ''}
                        onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">{t('fields.gender')}</Label>
                      <Select 
                        value={userProfile?.gender || ''} 
                        onValueChange={(value) => setUserProfile({ ...userProfile, gender: value })}
                        disabled={!isEditing || isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('fields.gender')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t('fields.genderMale')}</SelectItem>
                          <SelectItem value="female">{t('fields.genderFemale')}</SelectItem>
                          <SelectItem value="other">{t('fields.genderOther')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">{t('fields.dateOfBirth')}</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={userProfile?.date_of_birth || ''}
                        onChange={(e) => setUserProfile({ ...userProfile, date_of_birth: e.target.value })}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">{t('fields.country')}</Label>
                      <Input
                        id="country"
                        value={userProfile?.country || ''}
                        onChange={(e) => setUserProfile({ ...userProfile, country: e.target.value })}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('fields.city')}</Label>
                      <Input
                        id="city"
                        value={userProfile?.city || ''}
                        onChange={(e) => setUserProfile({ ...userProfile, city: e.target.value })}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="address">{t('fields.address')}</Label>
                      <Textarea
                        id="address"
                        value={userProfile?.address || ''}
                        onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                        disabled={!isEditing || isLoading}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Settings Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>{t('accountInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferred_language">{t('fields.language')}</Label>
                      <Select 
                        value={userProfile?.preferred_language || locale}
                        onValueChange={(value) => setUserProfile({ ...userProfile, preferred_language: value })}
                        disabled={!isEditing || isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('fields.language')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">{t('languages.arabic')}</SelectItem>
                          <SelectItem value="en">{t('languages.english')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">{t('fields.timezone')}</Label>
                      <Select 
                        value={userProfile?.timezone || 'Asia/Riyadh'}
                        onValueChange={(value) => setUserProfile({ ...userProfile, timezone: value })}
                        disabled={!isEditing || isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('fields.timezone')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Riyadh">{t('timezones.riyadh')}</SelectItem>
                          <SelectItem value="Asia/Jeddah">{t('timezones.jeddah')}</SelectItem>
                          <SelectItem value="Asia/Dubai">{t('timezones.dubai')}</SelectItem>
                          <SelectItem value="Europe/London">{t('timezones.london')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('notifications.title')}</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">{t('notifications.email')}</Label>
                        <p className="text-sm text-muted-foreground">{t('notifications.emailDesc')}</p>
                      </div>
                      <Switch 
                        id="email-notifications"
                        checked={userProfile?.notification_preferences?.email || false}
                        onCheckedChange={(value) => setUserProfile({ 
                          ...userProfile, 
                          notification_preferences: { 
                            ...userProfile.notification_preferences, 
                            email: value 
                          } 
                        })}
                        disabled={!isEditing || isLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications">{t('notifications.push')}</Label>
                        <p className="text-sm text-muted-foreground">{t('notifications.pushDesc')}</p>
                      </div>
                      <Switch 
                        id="push-notifications"
                        checked={userProfile?.notification_preferences?.push || false}
                        onCheckedChange={(value) => setUserProfile({ 
                          ...userProfile, 
                          notification_preferences: { 
                            ...userProfile.notification_preferences, 
                            push: value 
                          } 
                        })}
                        disabled={!isEditing || isLoading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-notifications">{t('notifications.sms')}</Label>
                        <p className="text-sm text-muted-foreground">{t('notifications.smsDesc')}</p>
                      </div>
                      <Switch 
                        id="sms-notifications"
                        checked={userProfile?.notification_preferences?.sms || false}
                        onCheckedChange={(value) => setUserProfile({ 
                          ...userProfile, 
                          notification_preferences: { 
                            ...userProfile.notification_preferences, 
                            sms: value 
                          } 
                        })}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Password Change Tab */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>{t('changePassword')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">{t('currentPassword')}</Label>
                      <Input
                        id="current_password"
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        disabled={isPasswordLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">{t('newPassword')}</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        disabled={isPasswordLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">{t('confirmPassword')}</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        disabled={isPasswordLoading}
                      />
                    </div>
                    <Button 
                      onClick={handlePasswordChange} 
                      disabled={isPasswordLoading || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                    >
                      {isPasswordLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('passwordLoading')}
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          {t('updatePassword')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recent Bookings Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('recentBookings')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isBookingsLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              ) : recentBookings && recentBookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('booking.id')}</TableHead>
                      <TableHead>{t('booking.package')}</TableHead>
                      <TableHead>{t('booking.date')}</TableHead>
                      <TableHead>{t('booking.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking: any) => (
                      <TableRow key={booking.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/${locale}/PilgrimUser/booking?id=${booking.id}`)}>
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell>{booking.package_name || booking.package?.name || t('booking.noPackage')}</TableCell>
                        <TableCell>
                          {booking.created_at ? format(new Date(booking.created_at), 'PPP', { locale: dateLocale }) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'pending' ? 'secondary' :
                            booking.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {booking.status === 'confirmed' ? t('booking.statusConfirmed') :
                             booking.status === 'pending' ? t('booking.statusPending') :
                             booking.status === 'cancelled' ? t('booking.statusCancelled') :
                             booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <p>{t('booking.noBookings')}</p>
                  <Button 
                    variant="link" 
                    onClick={() => router.push(`/${locale}/PilgrimUser/packages`)}
                    className="mt-2"
                  >
                    {t('booking.explorePackages')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 