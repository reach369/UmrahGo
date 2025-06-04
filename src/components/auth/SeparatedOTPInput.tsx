"use client";

import { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/auth.service";

interface SeparatedOTPInputProps {
  length?: number;
  onComplete?: (value: string) => void;
  email: string;
}

export default function SeparatedOTPInput({ length = 6, onComplete, email }: SeparatedOTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleSendOTP = async () => {
    try {
      setIsLoading(true);
      await authService.resendVerification(email);
      toast({
        title: "تم إرسال الرمز",
        description: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ في إرسال الرمز",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    // تنظيف القيمة للتأكد من أنها رقم فقط
    const cleanValue = value.replace(/[^0-9]/g, '');
    newOtp[index] = cleanValue.slice(-1);
    setOtp(newOtp);

    // التحقق من اكتمال الرقم والانتقال للحقل التالي
    if (cleanValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    console.log('Verifying with values:', {
      email: email,
      otpValue: otpValue,
      otpLength: otpValue.length,
      expectedLength: length
    });

    if (otpValue.length !== length) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء إدخال الرمز كاملاً",
      });
      return;
    }

    try {
      setIsVerifying(true);
      console.log('Starting verification with:', { email, otpValue });
      const response = await authService.verifyEmail(email, otpValue);
      
      console.log('Full verification response:', response);
      
      // Updated success check logic to match the actual API response structure
      const isSuccess = 
        response?.verified === true || // Direct check on response
        response?.email_verified === true; // Alternative check
      
      console.log('Success check result:', { isSuccess, response });

      if (isSuccess) {
        console.log('Verification successful, calling onComplete');
        if (onComplete) {
          onComplete(otpValue);
        }
      } else {
        console.log('Verification failed:', response);
        throw new Error(response?.message || "فشل التحقق من الرمز");
      }
    } catch (error: any) {
      console.error('Verification error:', {
        error,
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      toast({
        variant: "destructive",
        title: "خطأ في التحقق",
        description: error.message || "حدث خطأ أثناء التحقق من الرمز",
      });
      
      // إعادة تعيين الرمز عند الخطأ
      setOtp(new Array(length).fill(''));
      inputRefs.current[0]?.focus();
      setActiveInput(0);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // إذا كان الحقل الحالي فارغاً، انتقل للحقل السابق
        inputRefs.current[index - 1]?.focus();
        setActiveInput(index - 1);
      } else {
        // إذا كان الحقل الحالي يحتوي على رقم، امسحه
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // انتقل للحقل السابق عند الضغط على السهم الأيسر
      inputRefs.current[index - 1]?.focus();
      setActiveInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      // انتقل للحقل التالي عند الضغط على السهم الأيمن
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    const newOtp = [...otp];
    
    // ملء الأرقام من اليسار إلى اليمين
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // تركيز آخر خانة تم ملؤها
    if (pastedData.length > 0) {
      const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();
      setActiveInput(lastFilledIndex);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2" style={{ direction: 'ltr' }}>
        {otp.map((value, index) => (
          <Input
            key={index}
            ref={(el) => {
              if (el) {
                inputRefs.current[index] = el;
              }
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value}
            onChange={e => handleChange(e.target.value, index)}
            onKeyDown={e => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="w-12 h-12 text-center text-2xl"
            style={{ direction: 'ltr' }}
            autoFocus={index === 0}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={handleVerifyOTP}
          disabled={!isOtpComplete || isVerifying}
          className="w-full"
        >
          {isVerifying ? "جاري التحقق..." : "تأكيد الرمز"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleSendOTP}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'جاري إرسال الرمز...' : 'إرسال الرمز'}
        </Button>
      </div>
    </div>
  );
} 