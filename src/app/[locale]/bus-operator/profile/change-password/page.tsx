'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { changePassword } from '../../redux/busOperatorSlice';

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.busOperator);
  const t = useTranslations('BusOperatorDashboard');

  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) {
      errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('يجب أن تحتوي على حرف صغير واحد على الأقل');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('يجب أن تحتوي على رقم واحد على الأقل');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%^&*)');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    // Validate form
    const validationErrors = [];
    
    if (!formData.current_password) {
      validationErrors.push('كلمة المرور الحالية مطلوبة');
    }
    
    if (!formData.new_password) {
      validationErrors.push('كلمة المرور الجديدة مطلوبة');
    } else {
      const passwordErrors = validatePassword(formData.new_password);
      validationErrors.push(...passwordErrors);
    }
    
    if (formData.new_password !== formData.confirm_password) {
      validationErrors.push('كلمة المرور الجديدة وتأكيدها غير متطابقين');
    }
    
    if (formData.current_password === formData.new_password) {
      validationErrors.push('كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await dispatch(changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
        new_password_confirmation: formData.confirm_password,
      })).unwrap();
      
      setSuccess(true);
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      setErrors([error.message || 'حدث خطأ أثناء تغيير كلمة المرور']);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; text: string; color: string } => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;
    
    if (score <= 2) return { strength: score * 20, text: 'ضعيفة', color: 'bg-red-500' };
    if (score <= 3) return { strength: score * 20, text: 'متوسطة', color: 'bg-yellow-500' };
    if (score <= 4) return { strength: score * 20, text: 'جيدة', color: 'bg-blue-500' };
    return { strength: 100, text: 'قوية جداً', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.new_password);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">{t('profile.changePassword')}</h1>
        <p className="text-muted-foreground mt-2">
          قم بتحديث كلمة المرور الخاصة بك للحفاظ على أمان حسابك
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            تم تغيير كلمة المرور بنجاح! يمكنك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alerts */}
      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>تغيير كلمة المرور</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <Label htmlFor="current_password">كلمة المرور الحالية</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.current_password}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_password: e.target.value }))}
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={(e) => setFormData(prev => ({ ...prev, new_password: e.target.value }))}
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.new_password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>قوة كلمة المرور:</span>
                    <span className={`font-medium ${
                      passwordStrength.strength <= 40 ? 'text-red-600' :
                      passwordStrength.strength <= 60 ? 'text-yellow-600' :
                      passwordStrength.strength <= 80 ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirm_password">تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formData.confirm_password && formData.new_password !== formData.confirm_password && (
                <p className="text-sm text-red-600 mt-1">كلمة المرور غير متطابقة</p>
              )}
            </div>

            {/* Password Requirements */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 mb-2">متطلبات كلمة المرور:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li className={`flex items-center space-x-1 ${formData.new_password.length >= 8 ? 'text-green-600' : ''}`}>
                        <span>•</span>
                        <span>8 أحرف على الأقل</span>
                        {formData.new_password.length >= 8 && <CheckCircle className="w-3 h-3" />}
                      </li>
                      <li className={`flex items-center space-x-1 ${/[A-Z]/.test(formData.new_password) ? 'text-green-600' : ''}`}>
                        <span>•</span>
                        <span>حرف كبير واحد على الأقل</span>
                        {/[A-Z]/.test(formData.new_password) && <CheckCircle className="w-3 h-3" />}
                      </li>
                      <li className={`flex items-center space-x-1 ${/[a-z]/.test(formData.new_password) ? 'text-green-600' : ''}`}>
                        <span>•</span>
                        <span>حرف صغير واحد على الأقل</span>
                        {/[a-z]/.test(formData.new_password) && <CheckCircle className="w-3 h-3" />}
                      </li>
                      <li className={`flex items-center space-x-1 ${/[0-9]/.test(formData.new_password) ? 'text-green-600' : ''}`}>
                        <span>•</span>
                        <span>رقم واحد على الأقل</span>
                        {/[0-9]/.test(formData.new_password) && <CheckCircle className="w-3 h-3" />}
                      </li>
                      <li className={`flex items-center space-x-1 ${/[!@#$%^&*]/.test(formData.new_password) ? 'text-green-600' : ''}`}>
                        <span>•</span>
                        <span>رمز خاص واحد على الأقل (!@#$%^&*)</span>
                        {/[!@#$%^&*]/.test(formData.new_password) && <CheckCircle className="w-3 h-3" />}
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline">
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading.changePassword}>
                {loading.changePassword ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 