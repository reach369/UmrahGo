import { Metadata } from 'next';
import LayoutWithHeaderFooter from '../../layout-with-header-footer';
import LandingOfficeDetailsContent from '../../landing/umrah-offices/[id]/page';

export const metadata: Metadata = {
  title: 'تفاصيل مكتب العمرة - UmrahGo',
  description: 'تفاصيل وخدمات مكتب العمرة',
};

// This is a public page - no authentication required
export default function OfficeDetailsPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  return (
    <LayoutWithHeaderFooter>
      <LandingOfficeDetailsContent params={params} />
    </LayoutWithHeaderFooter>
  );
} 