import { ReactNode } from 'react';

// واجهة خصائص التخطيط
export interface LayoutProps {
  children: ReactNode; // المحتوى الفرعي
  params: {
    locale: string; // اللغة المحلية
  };
}

// واجهة خصائص الصفحة
export interface PageProps {
  params: {
    locale: string; // اللغة المحلية
  };
  searchParams: { [key: string]: string | string[] | undefined }; // معلمات البحث
}

// واجهة خصائص البيانات الوصفية
export interface MetadataProps {
  title: string; // العنوان
  description: string; // الوصف
} 