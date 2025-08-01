import { Metadata } from 'next';
import LayoutWithHeaderFooter from '../layout-with-header-footer';
import LandingPackagesContent from '../landing/packages/page';

export const metadata: Metadata = {
  title: 'باقات العمرة - UmrahGo',
  description: 'اكتشف باقات العمرة المتنوعة والمناسبة لجميع الميزانيات',
};

// This is a public page - no authentication required
export default function PackagesPage() {
  return (
    <LayoutWithHeaderFooter>
      <LandingPackagesContent params={{}} />
    </LayoutWithHeaderFooter>
  );
} 