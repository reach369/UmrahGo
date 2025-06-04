'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '@/lib/auth.service';

// نموذج بيانات تغيير كلمة المرور
interface ChangePasswordFormData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // حالات عرض/إخفاء كلمات المرور
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  // إعداد React Hook Form
  const { register, handleSubmit, formState: { errors }, watch, setError } = useForm<ChangePasswordFormData>();
  
  // متابعة قيمة كلمة المرور الجديدة للتحقق من التطابق
  const newPassword = watch('password');

  // معالجة تقديم النموذج
  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsSaving(true);
      
      // إرسال طلب تغيير كلمة المرور
      const response = await authService.updatePassword({
        current_password: data.current_password,
        password: data.password,
        password_confirmation: data.password_confirmation
      });
      
      // إظهار رسالة نجاح
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تغيير كلمة المرور بنجاح، يمكنك الآن استخدام كلمة المرور الجديدة"
      });
      
      // العودة إلى صفحة الملف الشخصي
      router.push('/PilgrimUser/profile');
    } catch (error: any) {
      console.error('فشل في تغيير كلمة المرور:', error);
      
      // التعامل مع أخطاء محددة
      if (error.message.includes('current password is incorrect') || 
          error.message.includes('كلمة المرور الحالية غير صحيحة')) {
        setError('current_password', {
          type: 'manual',
          message: 'كلمة المرور الحالية غير صحيحة'
        });
      } else if (error.message.includes('غير متطابقين')) {
        setError('password_confirmation', {
          type: 'manual',
          message: 'كلمة المرور الجديدة وتأكيدها غير متطابقين'
        });
      } else {
        // إظهار رسالة خطأ عامة
        toast({
          variant: "destructive",
          title: "خطأ",
          description: error.message || "فشل في تغيير كلمة المرور. يرجى المحاولة مرة أخرى."
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // التحقق من قوة كلمة المرور
  const validatePasswordStrength = (password: string) => {
    const validation = authService.validatePassword(password);
    return validation.isValid || validation.message;
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">تغيير كلمة المرور</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>أدخل كلمة المرور الجديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">كلمة المرور الحالية</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showCurrentPassword ? "text" : "password"}
                  {...register("current_password", { 
                    required: "كلمة المرور الحالية مطلوبة" 
                  })}
                  className={errors.current_password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-red-500 text-sm">{errors.current_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showNewPassword ? "text" : "password"}
                  {...register("password", { 
                    required: "كلمة المرور الجديدة مطلوبة",
                    minLength: {
                      value: 8,
                      message: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل"
                    },
                    validate: validatePasswordStrength
                  })}
                  className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message as string}</p>
              )}
              {!errors.password && (
                <p className="text-xs text-muted-foreground">
                  يجب أن تحتوي كلمة المرور على حرف كبير وحرف صغير ورقم ورمز خاص، وأن تكون 8 أحرف على الأقل
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  {...register("password_confirmation", { 
                    required: "تأكيد كلمة المرور مطلوب",
                    validate: value => value === newPassword || "كلمات المرور غير متطابقة"
                  })}
                  className={errors.password_confirmation ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                >
                  {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/PilgrimUser/profile')}
                disabled={isSaving}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> جاري التغيير...</>
                ) : "تغيير كلمة المرور"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 