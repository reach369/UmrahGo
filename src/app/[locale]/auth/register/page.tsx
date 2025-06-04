"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { UserRegistrationData, ServiceProviderRegistrationData } from '@/types/auth.types';
import { authService } from '@/lib/auth.service';
import { getRedirectPathAfterLogin, handleApiError } from '@/lib/utils';
import Link from 'next/link';
import SocialLogin from '@/components/auth/SocialLogin';
import { Separator } from '@/components/ui/separator';
import { StatusDialog } from '@/components/ui/status-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Eye, EyeOff } from 'lucide-react'; // استيراد أيقونات العين

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // حالة إظهار/إخفاء كلمة المرور
  const [userType, setUserType] = useState('customer'); // نوع الحساب - المعتمر هو الافتراضي
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<UserRegistrationData>();
  const password = watch('password');

  // تبديل حالة إظهار/إخفاء كلمة المرور
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: UserRegistrationData) => {
    try {
      setIsLoading(true);
      setResult(null);
      
      // التأكد من تطابق كلمتي المرور
      if (data.password !== data.password_confirmation) {
        throw new Error('كلمتا المرور غير متطابقتين');
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
        title: "تم إنشاء الحساب بنجاح",
        description: "يرجى التحقق من بريدك الإلكتروني",
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
        title: "فشل إنشاء الحساب",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">إنشاء حساب جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SocialLogin onSuccess={() => router.push(`/${locale}/PilgrimUser`)} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  أو إنشاء حساب باستخدام البريد الإلكتروني
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* نوع الحساب */}
              <div className="space-y-2">
                <Label>نوع الحساب</Label>
                <RadioGroup 
                  defaultValue="customer" 
                  className="flex space-x-4 space-x-reverse" 
                  value={userType}
                  onValueChange={setUserType}
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="customer" id="customer" />
                    <Label htmlFor="customer">معتمر</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="office" id="office" />
                    <Label htmlFor="office">مكتب عمرة</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
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
                  placeholder="أدخل اسمك الكامل"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
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
                  placeholder="أدخل بريدك الإلكتروني"
                  className={errors.email ? "border-red-500" : ""}
                  dir="ltr"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone", {
                    pattern: {
                      value: /^\+?[0-9]{10,15}$/,
                      message: "رقم الهاتف غير صالح"
                    }
                  })}
                  placeholder="أدخل رقم هاتفك مثل +966XXXXXXXXX"
                  className={errors.phone ? "border-red-500" : ""}
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone.message}</p>
                )}
              </div>

              {/* حقول إضافية لمكاتب العمرة */}
              {userType === 'office' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="office_name">اسم المكتب</Label>
                    <Input
                      id="office_name"
                      type="text"
                      {...register("office_name", {
                        required: userType === 'office' ? "اسم المكتب مطلوب" : false
                      })}
                      placeholder="أدخل اسم مكتب العمرة"
                      className={errors.office_name ? "border-red-500" : ""}
                    />
                    {errors.office_name && (
                      <p className="text-red-500 text-sm">{errors.office_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_number">رقم الترخيص</Label>
                    <Input
                      id="license_number"
                      type="text"
                      {...register("license_number", {
                        required: userType === 'office' ? "رقم الترخيص مطلوب" : false
                      })}
                      placeholder="أدخل رقم ترخيص المكتب"
                      className={errors.license_number ? "border-red-500" : ""}
                      dir="ltr"
                    />
                    {errors.license_number && (
                      <p className="text-red-500 text-sm">{errors.license_number.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commercial_register">السجل التجاري</Label>
                    <Input
                      id="commercial_register"
                      type="text"
                      {...register("commercial_register", {
                        required: userType === 'office' ? "رقم السجل التجاري مطلوب" : false
                      })}
                      placeholder="أدخل رقم السجل التجاري"
                      className={errors.commercial_register ? "border-red-500" : ""}
                      dir="ltr"
                    />
                    {errors.commercial_register && (
                      <p className="text-red-500 text-sm">{errors.commercial_register.message}</p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "كلمة المرور مطلوبة",
                      minLength: {
                        value: 8,
                        message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
                      }
                    })}
                    placeholder="أدخل كلمة المرور"
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، وحرف كبير، ورقم، وحرف خاص
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    type={showPassword ? "text" : "password"}
                    {...register("password_confirmation", {
                      required: "تأكيد كلمة المرور مطلوب",
                      validate: value => value === password || "كلمتا المرور غير متطابقتين"
                    })}
                    placeholder="أعد إدخال كلمة المرور"
                    className={errors.password_confirmation ? "border-red-500 pr-10" : "pr-10"}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary"
                disabled={isLoading}
              >
                {isLoading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
              </Button>

              <Button
                type="button"
                className="w-full bg-secondary"
                disabled={isLoading}
                onClick={() => {
                  const testData: UserRegistrationData = {
                    name: "John Doe",
                    // email: `test${Math.floor(Math.random() * 10000)}@gmail.com`,
                    email: `sapafal787@dlbazi.com`,
                    password: "Password123!",
                    password_confirmation: "Password123!",
                    phone: "+966500000001",
                    user_type: userType
                  };
                  
                  // إضافة بيانات مكتب العمرة إذا كان نوع الحساب مكتب
                  if (userType === 'office') {
                    testData.office_name = "مكتب النور للعمرة";
                    testData.license_number = "UMR12345";
                    testData.commercial_register = "CR98765";
                  }
                  
                  onSubmit(testData);
                }}
              >
                إنشاء حساب تجريبي
              </Button>

              {result && (
                <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <h3 className="font-bold mb-2">{result.success ? '✅ نجاح' : '❌ خطأ'}</h3>
                  <p className="mb-2">{result.message}</p>
                  {result.details && (
                    <pre className="text-xs bg-black/5 p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              <p className="text-center text-sm">
                لديك حساب بالفعل؟{" "}
                <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}