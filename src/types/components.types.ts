import { User } from './auth.types';

// واجهة خصائص ملف تعريف المستخدم
export interface UserProfileProps {
  initialData: User;
}

// واجهة خصائص الرأس
export interface HeaderProps {
  changelag: string; // تغيير اللغة
  en: string; // الإنجليزية
  ar: string; // العربية
  home: string; // الرئيسية
  about: string; // حول
  Ourserver: string; // خدماتنا
  OurWork: string; // أعمالنا
  Testimonials: string; // الشهادات
  tem: string; // الفريق
  Trust: string; // الثقة
  contact: string; // اتصل بنا
}

// واجهة خصائص تبديل السمة
export interface ThemeToggleProps {
  className?: string; // اسم الفئة (اختياري)
}

// واجهة خصائص تغيير اللغة
export interface ChangeLangProps {
  className?: string; // اسم الفئة (اختياري)
}

// واجهة خصائص الزر
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'; // نوع الزر
  size?: 'default' | 'sm' | 'lg' | 'icon'; // حجم الزر
  asChild?: boolean; // تعيين كعنصر فرعي
} 