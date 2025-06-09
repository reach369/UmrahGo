import { TailwindTest } from '@/components/ui/tailwind-test';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test Page',
  description: 'Test page for UmrahGo',
};

export default function TestPage({ params }: { params: { locale: string } }) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">صفحة اختبار التنسيقات</h1>
      <TailwindTest />
    </div>
  );
} 