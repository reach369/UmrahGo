"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth.service';
import Link from 'next/link';
import { ForgotPasswordRequest } from '@/types/auth.types';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const { toast } = useToast();
  const t = useTranslations('auth.forgotPassword');
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [countdown, setCountdown] = useState(0);
  
  const { register: registerEmail, handleSubmit: handleSubmitEmail, formState: { errors: emailErrors } } = useForm<ForgotPasswordRequest>();
  const { register: registerReset, handleSubmit: handleSubmitReset, watch, formState: { errors: resetErrors } } = useForm<{
    otp: string;
    password: string;
    password_confirmation: string;
  }>();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const onSubmitEmail = async (data: ForgotPasswordRequest) => {
    try {
      setIsLoading(true);
      setEmail(data.email);
      
      // Request password reset OTP
      await authService.forgotPassword(data);
      
      toast({
        title: t('otpSent.title'),
        description: t('otpSent.description'),
      });

      // Move to reset step and start countdown
      setStep('reset');
      setCountdown(30);
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

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      
      // Resend verification code
      await authService.forgotPassword({ email });
      
      toast({
        title: t('otpSent.title'),
        description: t('otpSent.description'),
      });
      
      // Reset countdown
      setCountdown(30);
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

  const onSubmitReset = async (data: {otp: string, password: string, password_confirmation: string}) => {
    try {
      setIsLoading(true);
      
      // Validate passwords match
      if (data.password !== data.password_confirmation) {
        throw new Error(t('passwordMismatch'));
      }
      
      // Validate password strength
      const passwordValidation = authService.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }
      
      // Reset password with OTP
      await authService.resetPassword({
        email,
        otp: data.otp,
        password: data.password,
        password_confirmation: data.password_confirmation
      });
      
      toast({
        title: t('passwordReset.title'),
        description: t('passwordReset.description'),
      });
      
      // Redirect to login after successful reset
      setTimeout(() => {
        router.push(`/${locale}/auth/login`);
      }, 2000);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('passwordError.title'),
        description: error.message || t('passwordError.description'),
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
            href={`/${locale}/auth/login`}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{t('backButton')}</span>
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
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm dark:border dark:border-gray-700">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {step === 'email' ? t('title') : t('passwordTitle')}
              </CardTitle>
              <CardDescription>
                {step === 'email' ? t('description') : t('resetDescription')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {step === 'email' ? (
                // Email Form
                <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      {...registerEmail('email', {
                        required: t('emailRequired'),
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: t('emailInvalid')
                        }
                      })}
                      className={cn(
                        "h-12",
                        emailErrors.email && "border-red-500 focus:ring-red-500"
                      )}
                      disabled={isLoading}
                    />
                    {emailErrors.email && (
                      <p className="text-sm text-red-500">{emailErrors.email.message}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-gold hover:bg-gradient-primary text-primary-foreground"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('sending')}
                        </>
                      ) : (
                        t('sendButton')
                      )}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
                    <p>
                      {t('rememberPassword')}{' '}
                      <Link 
                        href={`/${locale}/auth/login`}
                        className="text-primary hover:underline font-medium"
                      >
                        {t('login')}
                      </Link>
                    </p>
                    <p className="mt-2">
                      {t('noAccount')}{' '}
                      <Link 
                        href={`/${locale}/auth/register`}
                        className="text-primary hover:underline font-medium"
                      >
                        {t('register')}
                      </Link>
                    </p>
                  </div>
                </form>
              ) : (
                // Reset Password Form
                <form onSubmit={handleSubmitReset(onSubmitReset)} className="space-y-4">
                  <div className="mb-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t('otpSentTo')}{' '}
                      <span className="font-medium text-primary">{email}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp">{t('tokenLabel')}</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder={t('tokenPlaceholder')}
                      {...registerReset('otp', {
                        required: t('tokenRequired'),
                        minLength: {
                          value: 6,
                          message: t('tokenLength')
                        }
                      })}
                      className={cn(
                        "h-12 text-center tracking-widest text-lg",
                        resetErrors.otp && "border-red-500 focus:ring-red-500"
                      )}
                      disabled={isLoading}
                    />
                    {resetErrors.otp && (
                      <p className="text-sm text-red-500">{resetErrors.otp.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t('passwordLabel')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('passwordPlaceholder')}
                      {...registerReset('password', {
                        required: t('passwordRequired'),
                        minLength: {
                          value: 8,
                          message: t('passwordMinLength')
                        }
                      })}
                      className={cn(
                        "h-12",
                        resetErrors.password && "border-red-500 focus:ring-red-500"
                      )}
                      disabled={isLoading}
                    />
                    {resetErrors.password && (
                      <p className="text-sm text-red-500">{resetErrors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">{t('confirmPasswordLabel')}</Label>
                    <Input
                      id="password_confirmation"
                      type="password"
                      placeholder={t('confirmPasswordPlaceholder')}
                      {...registerReset('password_confirmation', {
                        required: t('confirmPasswordRequired'),
                        validate: value => value === watch('password') || t('passwordMismatch')
                      })}
                      className={cn(
                        "h-12",
                        resetErrors.password_confirmation && "border-red-500 focus:ring-red-500"
                      )}
                      disabled={isLoading}
                    />
                    {resetErrors.password_confirmation && (
                      <p className="text-sm text-red-500">{resetErrors.password_confirmation.message}</p>
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

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-gold hover:bg-gradient-primary text-primary-foreground"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('resettingPassword')}
                        </>
                      ) : (
                        t('resetPasswordButton')
                      )}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
                    <Button
                      variant="link"
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading || countdown > 0}
                      className="p-0 h-auto font-normal"
                    >
                      {countdown > 0 
                        ? `${t('resendCodeIn')} ${countdown} ${t('seconds')}`
                        : t('resendCode')
                      }
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 