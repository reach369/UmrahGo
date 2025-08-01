import { Metadata } from 'next';
import LayoutWithHeaderFooter from '../layout-with-header-footer';
import LandingPrivacyContent from '../landing/privacy/page';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية - UmrahGo',
  description: 'اقرأ سياسة الخصوصية الخاصة بخدمات UmrahGo',
};

// This is a public page - no authentication required
export default function PrivacyPage() {
  return (
    <LayoutWithHeaderFooter>
      <LandingPrivacyContent />
    </LayoutWithHeaderFooter>
  );
} 