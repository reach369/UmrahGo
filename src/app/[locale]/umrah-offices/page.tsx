import { Metadata } from 'next';
import LayoutWithHeaderFooter from '../layout-with-header-footer';
import LandingUmrahOfficesContent from '../landing/umrah-offices/page';

export const metadata: Metadata = {
  title: 'مكاتب العمرة - UmrahGo',
  description: 'اكتشف أفضل مكاتب العمرة المعتمدة والموثوقة',
};

// This is a public page - no authentication required
export default function UmrahOfficesPage() {
  return (
    <LayoutWithHeaderFooter>
      <LandingUmrahOfficesContent />
    </LayoutWithHeaderFooter>
  );
} 