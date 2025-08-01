'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, KeyRound, Save } from 'lucide-react';
import { useChangePasswordMutation } from '../../../redux/api/authApiSlice';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  
  // Form state
  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  
  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    // Validate current password
    if (!formData.current_password.trim()) {
      newErrors.current_password = 'كلمة المرور الحالية مطلوبة';
      isValid = false;
    }
    
    // Validate new password
    if (!formData.password.trim()) {
      newErrors.password = 'كلمة المرور الجديدة مطلوبة';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'يجب أن تكون كلمة المرور 8 أحرف على الأقل';
      isValid = false;
    }
    
    // Validate password confirmation
    if (!formData.password_confirmation.trim()) {
      newErrors.password_confirmation = 'تأكيد كلمة المرور مطلوب';
      isValid = false;
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'كلمات المرور غير متطابقة';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await changePassword(formData).unwrap();
      
      toast({
        title: 'تم تغيير كلمة المرور بنجاح',
        description: 'تم تحديث كلمة المرور الخاصة بك بنجاح',
        variant: 'default',
      });
      
      // Reset form
      setFormData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
      
      // Navigate back to profile page
      router.push('../profile');
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      // Handle API validation errors
      if (error?.data?.errors) {
        const apiErrors = error.data.errors;
        const newErrors = { ...errors };
        
        if (apiErrors.current_password) {
          newErrors.current_password = apiErrors.current_password[0];
        }
        if (apiErrors.password) {
          newErrors.password = apiErrors.password[0];
        }
        if (apiErrors.password_confirmation) {
          newErrors.password_confirmation = apiErrors.password_confirmation[0];
        }
        
        setErrors(newErrors);
      } else {
        // Show general error toast
        toast({
          title: 'فشل تغيير كلمة المرور',
          description: error?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة مرة أخرى.',
          variant: 'destructive',
        });
      }
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound size={20} />
            تغيير كلمة المرور
          </CardTitle>
          <CardDescription>
            أدخل كلمة المرور الحالية وكلمة المرور الجديدة لتحديث حسابك
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">كلمة المرور الحالية</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  name="current_password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.current_password}
                  onChange={handleInputChange}
                  className={errors.current_password ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-red-500 text-sm mt-1">{errors.current_password}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500">
                يجب أن تكون كلمة المرور 8 أحرف على الأقل
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className={errors.password_confirmation ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('../profile')}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="mr-2">جاري الحفظ...</span>
                  <span className="animate-spin">⊝</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  حفظ كلمة المرور
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 