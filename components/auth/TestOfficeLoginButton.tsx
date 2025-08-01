"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth.service";

export default function TestOfficeLoginButton() {
  const { toast } = useToast();
  const router = useRouter();

  const handleTestLogin = async () => {
    try {
      // بيانات تجريبية لتسجيل مكتب جديد
      const timestamp = Date.now();
      const testOfficeData = {
        name: "Al Baraka Umrah Services",
        // email: `office${timestamp}@albaraka.com`,
        email: `jigaw53875@frisbook.com`,
        password: "Password123!",
        password_confirmation: "Password123!",
        phone: "+966500000002",
        country: "Saudi Arabia",
        user_type: "office",
        office_name: "Al Baraka Umrah Services", // تغيير من office_name_ar و office_name_en إلى office_name
        office_name_ar: "خدمات البركة للعمرة",
        office_name_en: "Al Baraka Umrah Services",
        commercial_register: "1234567890",
        license_number: "UMR12345",
        address: "123 King Abdulaziz Road, Riyadh",
        city: "Riyadh",
        description: "Providing premium Umrah services with a focus on customer satisfaction."
      };

      console.log('Attempting to register office with data:', testOfficeData);

      // تسجيل المكتب
      const response = await authService.registerOffice(testOfficeData);
      console.log('Registration response:', response);

      if (response.data?.token) {
        // حفظ بيانات المصادقة
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('token_type', response.data.token_type);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "سيتم توجيهك إلى صفحة التحقق",
        });

        // توجيه المستخدم إلى صفحة التحقق من البريد الإلكتروني
        router.push(`/ar/auth/verify-office?email=${encodeURIComponent(testOfficeData.email)}`);
      } else {
        throw new Error('لم يتم استلام رمز المصادقة من الخادم');
      }
    } catch (error: any) {
      console.error('Register Office Error:', {
        error: error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });

      let errorMessage = error.message;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الحساب",
        description: errorMessage || "حدث خطأ أثناء إنشاء الحساب",
      });
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleTestLogin}
    >
      إنشاء حساب مكتب تجريبي
    </Button>
  );
} 