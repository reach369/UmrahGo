import { Metadata } from 'next';
import LayoutWithHeaderFooter from '../layout-with-header-footer';
import LandingContactContent from '../landing/contact/page';

export const metadata: Metadata = {
  title: 'اتصل بنا - UmrahGo',
  description: 'تواصل معنا للحصول على أفضل خدمات العمرة',
};

// This is a public page - no authentication required
export default function ContactPage() {
  return (
    <LayoutWithHeaderFooter>
      <LandingContactContent />
    </LayoutWithHeaderFooter>
  );
} 