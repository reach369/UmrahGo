"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/auth.service";

interface OTPInputProps {
  onSendSuccess?: () => void;
  onVerifySuccess?: () => void;
  initialPhone?: string;
  initialEmail?: string;
}

export default function OTPInput({ onSendSuccess, onVerifySuccess, initialPhone, initialEmail }: OTPInputProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [contact, setContact] = useState(initialPhone || initialEmail || '');
  const [contactType, setContactType] = useState<'phone' | 'email'>(initialPhone ? 'phone' : 'email');
  const [otpCode, setOtpCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateContact = () => {
    if (contactType === 'phone' && !authService.validateSaudiPhoneNumber(contact)) {
      throw new Error('رقم الهاتف غير صالح. يجب أن يبدأ بـ +966 ويتكون من 12 رقم');
    }

    if (contactType === 'email' && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(contact)) {
      throw new Error('البريد الإلكتروني غير صالح');
    }
  };

  const handleSendOTP = async () => {
    try {
      setIsLoading(true);
      validateContact();

      await authService.sendOTP({
        [contactType]: contact
      });

      toast({
        title: "تم إرسال رمز التحقق",
        description: `تم إرسال رمز التحقق إلى ${contactType === 'phone' ? 'رقم الهاتف' : 'البريد الإلكتروني'} المدخل`,
      });

      setCountdown(60);
      setShowVerification(true);
      onSendSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في إرسال رمز التحقق",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      validateContact();

      await authService.resendOTP({
        [contactType]: contact
      });

      toast({
        title: "تم إعادة إرسال رمز التحقق",
        description: `تم إرسال رمز تحقق جديد إلى ${contactType === 'phone' ? 'رقم الهاتف' : 'البريد الإلكتروني'} المدخل`,
      });

      setCountdown(60);
      setOtpCode(''); // مسح الرمز القديم
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في إعادة إرسال رمز التحقق",
        description: error.message,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setIsVerifying(true);

      if (!otpCode || otpCode.length < 6) {
        throw new Error('الرجاء إدخال رمز التحقق المكون من 6 أرقام');
      }

      await authService.verifyOTP({
        [contactType]: contact,
        otp: otpCode
      });

      toast({
        title: "تم التحقق بنجاح",
        description: "تم التحقق من الرمز بنجاح",
      });

      onVerifySuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في التحقق",
        description: error.message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact">
          {contactType === 'phone' ? 'رقم الهاتف' : 'البريد الإلكتروني'}
        </Label>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Input
            id="contact"
            type={contactType === 'phone' ? 'tel' : 'email'}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={
              contactType === 'phone'
                ? '+966xxxxxxxxx'
                : 'example@domain.com'
            }
            className={contactType === 'phone' ? 'text-left' : ''}
            dir={contactType === 'phone' ? 'ltr' : 'rtl'}
            disabled={isLoading || countdown > 0 || showVerification}
          />
          {!showVerification ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleSendOTP}
              disabled={isLoading}
            >
              {isLoading ? 'جاري الإرسال...' : 'إرسال الرمز'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOTP}
              disabled={isResending || countdown > 0}
            >
              {countdown > 0
                ? `إعادة الإرسال (${countdown})`
                : isResending
                ? 'جاري إعادة الإرسال...'
                : 'إعادة إرسال الرمز'}
            </Button>
          )}
        </div>
      </div>

      {showVerification && (
        <div className="space-y-2">
          <Label htmlFor="otp">رمز التحقق</Label>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder="أدخل رمز التحقق المكون من 6 أرقام"
              className="text-center"
              disabled={isVerifying}
            />
            <Button
              type="button"
              onClick={handleVerifyOTP}
              disabled={isVerifying || otpCode.length !== 6}
            >
              {isVerifying ? 'جاري التحقق...' : 'تحقق'}
            </Button>
          </div>
        </div>
      )}

      {!initialPhone && !initialEmail && !showVerification && (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setContactType(contactType === 'phone' ? 'email' : 'phone');
              setContact('');
            }}
            disabled={isLoading || countdown > 0}
          >
            تبديل إلى {contactType === 'phone' ? 'البريد الإلكتروني' : 'رقم الهاتف'}
          </Button>
        </div>
      )}
    </div>
  );
} 