'use client';

import { useState, use } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { authService } from '@/lib/auth.service';
import { setAuthToken } from '@/lib/axios';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import SocialLogin from '@/components/auth/SocialLogin';

// Define the form values type
interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale as string || 'ar';
  const t = useTranslations('auth.login');
  const tc = useTranslations('auth.common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUserData, getUserRole } = useSessionPersistence();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Starting login process...');

      const response = await authService.login(data);
      
      if (response.status && response.data) {
        const { user, token, token_type } = response.data;
        
        console.log('Login successful, setting user data...');
        
        setAuthToken(token, token_type);
        setUserData(user, token);
        
        localStorage.setItem('token', token);
        localStorage.setItem('token_type', token_type || 'Bearer');
        localStorage.setItem('user', JSON.stringify(user));
        
        toast({
          title: t('success.title'),
          description: t('success.description'),
          duration: 3000,
        });

        let redirectPath = `/${locale}/PilgrimUser`;
        
        if (user.umrah_office) {
          console.log('User has umrah_office property, redirecting to office dashboard');
          redirectPath = `/${locale}/umrahoffices/dashboard`;
        } else {
          const userRole = getUserRole();
          
          switch (userRole) {
            case 'office':
              redirectPath = `/${locale}/umrahoffices/dashboard`;
              break;
            case 'bus_operator':
              redirectPath = `/${locale}/bus-operator`;
              break;
            case 'admin':
              redirectPath = `/${locale}/admin/dashboard`;
              break;
            default:
              redirectPath = `/${locale}/PilgrimUser`;
          }
        }
        
        console.log(`Redirecting to ${redirectPath}`);
        
        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
        
      } else {
        throw new Error(t('error.invalidCredentials'));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = t('error.description');
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: t('error.title'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLoginSuccess = () => {
    console.log('Social login successful, redirecting...');
    
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        let redirectPath = `/${locale}/PilgrimUser`;
        
        if (user.umrah_office) {
          redirectPath = `/${locale}/umrahoffices/dashboard`;
        } else if (user.roles) {
          const userRole = user.roles.find((role: any) => 
            ['office', 'bus_operator', 'admin', 'pilgrim', 'customer'].includes(role.name)
          )?.name;
          
          switch (userRole) {
            case 'office':
              redirectPath = `/${locale}/umrahoffices/dashboard`;
              break;
            case 'bus_operator':
              redirectPath = `/${locale}/bus-operator`;
              break;
            case 'admin':
              redirectPath = `/${locale}/admin/dashboard`;
              break;
            default:
              redirectPath = `/${locale}/PilgrimUser`;
          }
        }
        
        console.log(`Social login - redirecting to ${redirectPath}`);
        setTimeout(() => {
          router.push(redirectPath);
        }, 2000);
        
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        router.push(`/${locale}/PilgrimUser`);
      }
    } else {
      router.push(`/${locale}/PilgrimUser`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="w-full p-4 lg:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            href={`/${locale}`}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{t('backToHome', { ns: 'auth' })}</span>
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
          <Card className="shadow-xl border border-primary/10 bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-6 border-b border-primary/10">
              <CardTitle className="text-2xl lg:text-3xl font-bold text-gradient-gold mb-2">
                {t('title')}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                {t('description')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 px-6 lg:px-8 pt-6">
              {/* Social Login Section */}
              <div className="space-y-4">
                <SocialLogin 
                  onSuccess={handleSocialLoginSuccess}
                  variant="outline"
                  className="w-full"
                  mode="login"
                />
                
                <div className="relative my-6">
                  <Separator className="bg-primary/20 dark:bg-primary/10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className=" dark:bg-gray-800 px-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {t('or')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 dark:border-destructive/30">
                  <p className="text-sm text-destructive dark:text-destructive/90 text-center">{error}</p>
                </div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    disabled={isLoading}
                    {...register('email', {
                      required: tc('required'),
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: tc('invalidEmail')
                      }
                    })}
                    className={`h-12 text-base  dark:bg-gray-700/70 dark:text-white ${
                      errors.email 
                        ? 'border-destructive dark:border-destructive focus:border-destructive focus:ring-destructive/20' 
                        : 'border-primary/20 dark:border-primary/10 focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive dark:text-destructive/90">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('passwordPlaceholder')}
                      disabled={isLoading}
                      {...register('password', {
                        required: tc('required'),
                        minLength: {
                          value: 6,
                          message: tc('passwordTooShort')
                        }
                      })}
                      className={`h-12 text-base pr-12  dark:bg-gray-700/70 dark:text-white ${
                        errors.password 
                          ? 'border-destructive dark:border-destructive focus:border-destructive focus:ring-destructive/20' 
                          : 'border-primary/20 dark:border-primary/10 focus:border-primary focus:ring-primary/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive dark:text-destructive/90">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    href={`/${locale}/auth/forgot-password`}
                    className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light hover:underline font-medium transition-colors"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-gold hover:bg-gradient-primary text-primary-foreground font-semibold text-base rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('loading')}
                    </>
                  ) : (
                    t('submit')
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6 pb-8 px-6 lg:px-8 border-t border-primary/10">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                {t('noAccount')}{' '}
                <Link
                  href={`/${locale}/auth/register`}
                  className="text-primary hover:text-primary-dark dark:hover:text-primary-light hover:underline font-semibold transition-colors"
                >
                  {t('register')}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 