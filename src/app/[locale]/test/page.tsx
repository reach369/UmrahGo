import { TailwindTest } from '@/components/ui/tailwind-test';

export const metadata = {
  title: 'Test Page',
  description: 'Test page for UmrahGo',
};

export default function TestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">صفحة اختبار التنسيقات</h1>
      <TailwindTest />
    </div>
  );
} 