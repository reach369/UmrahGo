import { Metadata } from 'next';
import LayoutWithHeaderFooter from './layout-with-header-footer';
import LandingHomeContent from './landing/home/page';

export const metadata: Metadata = {
  title: 'UmrahGo - خدمات العمرة الميسرة',
  description: 'منصة UmrahGo توفر حلول العمرة المتكاملة بطريقة سهلة وميسرة',
};

export default function HomePage({ params }: { params: { locale: string } }) {
  return (
    <LayoutWithHeaderFooter>
      <LandingHomeContent />
    </LayoutWithHeaderFooter>
  );
}