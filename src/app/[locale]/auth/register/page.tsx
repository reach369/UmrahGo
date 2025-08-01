"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { UserRegistrationData, ServiceProviderRegistrationData } from '@/types/auth.types';
import { authService } from '@/lib/auth.service';
import { getRedirectPathAfterLogin, handleApiError, cn } from '@/lib/utils';
import Link from 'next/link';
import SocialLogin from '@/components/auth/SocialLogin';
import { Separator } from '@/components/ui/separator';
import { StatusDialog } from '@/components/ui/status-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { validatePhoneNumber, normalizePhoneNumber } from '@/utils/phone-utils';
import type { E164Number } from 'libphonenumber-js/core';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const { toast } = useToast();
  const t = useTranslations('auth.register');
  const tc = useTranslations('common');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('customer');
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  
  const { register, handleSubmit, control, formState: { errors }, watch } = useForm<UserRegistrationData>();
  const password = watch('password');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: UserRegistrationData) => {
    try {
      setIsLoading(true);
      setResult(null);
      
      // التأكد من تطابق كلمتي المرور
      if (data.password !== data.password_confirmation) {
        throw new Error(t('error.passwordMismatch'));
      }

      // التحقق من قوة كلمة المرور
      const passwordValidation = authService.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      
      // تحويل البيانات إلى النوع المطلوب
      const userData = {
        ...data,
        phone: data.phone || '', // تأكد من أن رقم الهاتف دائماً سلسلة نصية
        email: data.email.replace('example.com', 'gmail.com'), // تبديل example.com إلى gmail.com لتجنب مشاكل البريد
        user_type: userType // إضافة نوع المستخدم إلى البيانات
      };
      
      let response;
      if (userType === 'office') {
        // Make sure required fields for office registration are set
        if (!data.office_name) {
          throw new Error('اسم المكتب مطلوب');
        }
        if (!data.license_number) {
          throw new Error('رقم الترخيص مطلوب');
        }
        if (!data.commercial_register) {
          throw new Error('رقم السجل التجاري مطلوب');
        }
        
        // استدعاء API تسجيل المكتب
        response = await authService.registerOffice(userData as ServiceProviderRegistrationData);
      } else {
        // استدعاء API تسجيل المعتمر
        response = await authService.registerUser(userData);
      }
      
      console.log('Registration successful:', response);

      setResult({
        success: response.status,
        message: response.message,
        details: response
      });

      // تعديل مسار التوجيه بعد التسجيل الناجح
      toast({
        title: t('success.title'),
        description: t('success.description'),
      });
      
      // انتظر لحظة قبل التوجيه
      setTimeout(() => {
        router.push(`/${locale}/auth/verify?email=${encodeURIComponent(userData.email)}`);
      }, 1500);
    } catch (error: any) {
      console.error('Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url, // إضافة عنوان URL للطلب للتحقق من المسار
      });

      // استخدام دالة معالجة الأخطاء لتوفير رسائل خطأ أكثر ودية للمستخدم
      const errorMessage = handleApiError(error);

      setResult({
        success: false,
        message: errorMessage,
        details: {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        }
      });

      // عرض نخب خطأ للمستخدم
      toast({
        variant: "destructive",
        title: t('error.title'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="w-full p-4 lg:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href={`/${locale}`}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">
              {locale === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-gradient-gold">
              {locale === 'ar' ? 'عمرة قو' : 'UmrahGo'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
        <div className="w-full max-w-2xl">
          <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm dark:border dark:border-gray-700">
            <CardHeader className="space-y-1 text-center pb-6">
              <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('title')}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                {t('description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SocialLogin onSuccess={() => router.push(`/${locale}/PilgrimUser`)} />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full bg-gray-200 dark:bg-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className=" dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                      {t('or')}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* نوع الحساب */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">{t('userType')}</Label>
                    <RadioGroup 
                      defaultValue="customer" 
                      className="flex space-x-4 space-x-reverse" 
                      value={userType}
                      onValueChange={setUserType}
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="customer" id="customer" className="text-primary border-primary" />
                        <Label htmlFor="customer" className="text-gray-700 dark:text-gray-300">{t('customerType')}</Label>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="office" id="office" className="text-primary border-primary" />
                        <Label htmlFor="office" className="text-gray-700 dark:text-gray-300">{t('officeType')}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">{t('name')}</Label>
                    <Input
                      id="name"
                      type="text"
                      {...register("name", {
                        required: "الاسم مطلوب",
                        minLength: {
                          value: 3,
                          message: "الاسم يجب أن يكون على الأقل 3 أحرف"
                        }
                      })}
                      placeholder={t('namePlaceholder')}
                      className={cn(
                        " dark:bg-gray-700 dark:text-white dark:border-gray-600",
                        errors.name ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : 
                        "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20"
                      )}
                    />
                    {errors.name && (
                      <p className="text-red-500 dark:text-red-400 text-sm">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: "البريد الإلكتروني مطلوب",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "البريد الإلكتروني غير صالح"
                        }
                      })}
                      placeholder={t('emailPlaceholder')}
                      className={cn(
                        " dark:bg-gray-700 dark:text-white dark:border-gray-600",
                        errors.email ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : 
                        "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20"
                      )}
                      dir="ltr"
                    />
                    {errors.email && (
                      <p className="text-red-500 dark:text-red-400 text-sm">{errors.email.message}</p>
                    )}
                  </div>

                  {/* حقل رقم الهاتف */}
                  <div className="space-y-2">
                    <Controller
                      name="phone"
                      control={control}
                      rules={{
                        validate: (value) => {
                          if (!value) return true; // Phone is optional
                          return validatePhoneNumber(value) || "رقم الهاتف غير صالح";
                        }
                      }}
                      render={({ field: { onChange, value, onBlur } }) => (
                        <PhoneNumberInput
                          id="phone"
                          label={t('phone')}
                          defaultCountry="SA"
                          value={value}
                          onChange={onChange}
                          onBlur={onBlur}
                          error={errors.phone?.message}
                          placeholder={t('phonePlaceholder')}
                        />
                      )}
                    />
                  </div>

                  {/* حقول إضافية لمكاتب العمرة */}
                  {userType === 'office' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="office_name" className="text-gray-700 dark:text-gray-300">اسم المكتب</Label>
                        <Input
                          id="office_name"
                          type="text"
                          {...register("office_name", {
                            required: userType === 'office' ? "اسم المكتب مطلوب" : false
                          })}
                          placeholder="أدخل اسم مكتب العمرة"
                          className={cn(
                            " dark:bg-gray-700 dark:text-white dark:border-gray-600",
                            errors.office_name ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : 
                            "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20"
                          )}
                        />
                        {errors.office_name && (
                          <p className="text-red-500 dark:text-red-400 text-sm">{errors.office_name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="license_number" className="text-gray-700 dark:text-gray-300">رقم الترخيص</Label>
                        <Input
                          id="license_number"
                          type="text"
                          {...register("license_number", {
                            required: userType === 'office' ? "رقم الترخيص مطلوب" : false
                          })}
                          placeholder="أدخل رقم ترخيص المكتب"
                          className={cn(
                            " dark:bg-gray-700 dark:text-white dark:border-gray-600",
                            errors.license_number ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : 
                            "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20"
                          )}
                          dir="ltr"
                        />
                        {errors.license_number && (
                          <p className="text-red-500 dark:text-red-400 text-sm">{errors.license_number.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commercial_register" className="text-gray-700 dark:text-gray-300">السجل التجاري</Label>
                        <Input
                          id="commercial_register"
                          type="text"
                          {...register("commercial_register", {
                            required: userType === 'office' ? "رقم السجل التجاري مطلوب" : false
                          })}
                          placeholder="أدخل رقم السجل التجاري"
                          className={cn(
                            " dark:bg-gray-700 dark:text-white dark:border-gray-600",
                            errors.commercial_register ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : 
                            "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20"
                          )}
                          dir="ltr"
                        />
                        {errors.commercial_register && (
                          <p className="text-red-500 dark:text-red-400 text-sm">{errors.commercial_register.message}</p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">{t('password')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...register("password", {
                          required: "كلمة المرور مطلوبة",
                          minLength: {
                            value: 8,
                            message: "كلمة المرور يجب أن تكون على الأقل 8 أحرف"
                          }
                        })}
                        placeholder={t('passwordPlaceholder')}
                        className={cn(
                          " dark:bg-gray-700 dark:text-white dark:border-gray-600 pr-10",
                          errors.password ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : 
                          "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20"
                        )}
                        dir="ltr"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 dark:text-red-400 text-sm">{errors.password.message}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-gray-700 dark:text-gray-300">{t('confirmPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="password_confirmation"
                        type={showPassword ? "text" : "password"}
                        {...register("password_confirmation", {
                          required: "تأكيد كلمة المرور مطلوب",
                          validate: value => value === password || "كلمتا المرور غير متطابقتين"
                        })}
                        placeholder={t('confirmPasswordPlaceholder')}
                        className={cn(
                          " dark:bg-gray-700 dark:text-white dark:border-gray-600 pr-10",
                          errors.password_confirmation ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800" : 
                          "border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary/20"
                        )}
                        dir="ltr"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <p className="text-red-500 dark:text-red-400 text-sm">{errors.password_confirmation.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-gold hover:bg-gradient-primary text-primary-foreground font-semibold text-base rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? t('loading') : t('submit')}
                  </Button>

                  {result && (
                    <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                      <h3 className="font-bold mb-2">{result.success ? '✅ نجاح' : '❌ خطأ'}</h3>
                      <p className="mb-2">{result.message}</p>
                      {result.details && (
                        <pre className="text-xs bg-black/5 dark:bg-black/20 p-2 rounded overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}

                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {t('haveAccount')}{" "}
                    <Link href={`/${locale}/auth/login`} className="text-primary dark:text-primary hover:text-primary-dark dark:hover:text-primary-light hover:underline font-semibold">
                      {t('login')}
                    </Link>
                  </p>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}