"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth.service';
import { ResetPasswordRequest } from '@/types/auth.types';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('auth.resetPassword');
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordRequest>({
    defaultValues: {
      email: email || '',
      token: token || '',
    }
  });

  const onSubmit = async (data: ResetPasswordRequest) => {
    try {
      // التحقق من صحة كلمة المرور
      const passwordValidation = authService.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      setIsLoading(true);
      await authService.resetPassword(data);
      
      toast({
        title: t('success.title'),
        description: t('success.description'),
      });

      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      router.push(`/${locale}/auth/login`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('error.title'),
        description: error.message || t('error.description'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // التحقق من وجود البريد الإلكتروني والرمز
  if (!email || !token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-red-500">{t('invalidLink')}</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {t('invalidLinkDescription')}
              </p>
              <Button
                onClick={() => router.push(`/${locale}/auth/forgot-password`)}
                className="mt-4"
              >
                {t('requestNewLink')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto shadow-lg border-0 dark:border dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: t('passwordRequired'),
                  minLength: {
                    value: 8,
                    message: t('passwordMinLength')
                  }
                })}
                placeholder={t('passwordPlaceholder')}
                className={errors.password ? "border-red-500" : ""}
                dir="ltr"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">{t('confirmPasswordLabel')}</Label>
              <Input
                id="password_confirmation"
                type="password"
                {...register("password_confirmation", {
                  required: t('confirmPasswordRequired'),
                  validate: (value) => value === watch('password') || t('passwordMismatch')
                })}
                placeholder={t('confirmPasswordPlaceholder')}
                className={errors.password_confirmation ? "border-red-500" : ""}
                dir="ltr"
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>
              )}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>{t('passwordRequirements')}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('passwordRequirement1')}</li>
                <li>{t('passwordRequirement2')}</li>
                <li>{t('passwordRequirement3')}</li>
                <li>{t('passwordRequirement4')}</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-gold hover:bg-gradient-primary text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('submitting')}
                </>
              ) : (
                t('submitButton')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 