import { Metadata } from 'next';
import LayoutWithHeaderFooter from '../layout-with-header-footer';
import LandingTermsContent from '../landing/terms/page';

export const metadata: Metadata = {
  title: 'الشروط والأحكام - UmrahGo',
  description: 'اقرأ الشروط والأحكام الخاصة بخدمات UmrahGo',
};

// This is a public page - no authentication required
export default function TermsPage() {
  return (
    <LayoutWithHeaderFooter>
      <LandingTermsContent />
    </LayoutWithHeaderFooter>
  );
} 