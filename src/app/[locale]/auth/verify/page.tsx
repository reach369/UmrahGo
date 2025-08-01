"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import SeparatedOTPInput from '@/components/auth/SeparatedOTPInput';
import { authService } from '@/lib/auth.service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const { toast } = useToast();
  const t = useTranslations('auth.verify');
  const [email, setEmail] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const emailParam = searchParams?.get('email');
    if (!emailParam) {
      toast({
        variant: "destructive",
        title: t('error.title'),
        description: t('error.missingEmail'),
      });
      router.push(`/${locale}/auth/register`);
      return;
    }
    setEmail(emailParam);
  }, [searchParams, router, toast, locale, t]);

  const handleOTPComplete = async (otpValue: string) => {
    try {
      setIsVerifying(true);
      setVerificationStatus('idle');
      setErrorMessage('');
      
      console.log('User verification starting with:', { email, otpValue });
      
      const response = await authService.verifyEmail(email, otpValue);
      console.log('User verification response:', response);

      // Enhanced response checking for different formats
      const isVerified = 
        response?.verified === true || 
        response?.email_verified === true || 
        response?.status === true || 
        (response?.data && (response.data.verified === true || response.data.email_verified === true));
      
      if (isVerified) {
        setVerificationStatus('success');
        
        toast({
          title: t('success.title'),
          description: t('success.description')
        });
        
        // Short delay before redirect for better UX
        setTimeout(() => {
          // Refresh first to update auth state
          router.refresh();
          
          // Try to get user type from response or stored user data
          let userType = 'PilgrimUser'; // Default
          try {
            const userData = localStorage.getItem('user');
            if (userData) {
              const user = JSON.parse(userData);
              // Check user type
              if (user.type === 'office' || user.user_type === 'office' || user.role === 'office_manager') {
                userType = 'umrahoffices/dashboard';
              } else if (user.type === 'bus_operator' || user.user_type === 'bus_operator') {
                userType = 'bus-operator';
              }
            }
          } catch (e) {
            console.error('Error getting user type:', e);
          }
          
          // التوجيه إلى صفحة المستخدم المناسبة
          router.push(`/${locale}/${userType}`);
        }, 2000);
      } else {
        // If the response doesn't clearly indicate success or failure
        const errorMsg = response?.message || t('error.invalidCode');
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('User verification error:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Format error message for better user experience
      let errorMsg = error.message || t('error.description');
      
      // Check for specific API errors
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors?.otp) {
        errorMsg = error.response.data.errors.otp[0];
      }
      
      // Set error state
      setVerificationStatus('error');
      setErrorMessage(errorMsg);

      toast({
        variant: "destructive",
        title: t('error.title'),
        description: errorMsg,
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleResendCode = async () => {
    try {
      const response = await authService.resendVerification(email);
      toast({
        title: t('resend.success'),
        description: t('resend.successDescription'),
      });
    } catch (error: any) {
      console.error('Error resending verification code:', error);
      
      // Extract the most useful error message
      let errorMsg = error.message;
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors?.email) {
        errorMsg = error.response.data.errors.email[0];
      }
      
      toast({
        variant: "destructive",
        title: t('resend.error'),
        description: errorMsg || t('resend.errorDescription'),
      });
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto shadow-lg border-0 dark:border dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center">
              {t('codeSentTo')}
              <br />
              <span className="font-semibold text-primary">{email}</span>
            </p>
            
            {verificationStatus === 'error' && (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('verificationError')}</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {verificationStatus === 'success' && (
              <Alert className="my-4 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle>{t('verificationSuccess')}</AlertTitle>
                <AlertDescription>{t('redirecting')}</AlertDescription>
              </Alert>
            )}
            
            <SeparatedOTPInput
              email={email}
              onComplete={handleOTPComplete}
              isDisabled={verificationStatus === 'success' || isVerifying}
            />
            
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                {t('didntReceiveCode')}
              </p>
              <Button 
                variant="link" 
                type="button" 
                onClick={handleResendCode}
                disabled={isVerifying}
              >
                {t('resendCode')}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push(`/${locale}/auth/login`)}
            className="w-full"
          >
            {t('backToLogin')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 