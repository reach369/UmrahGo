import { Metadata } from 'next';
import LayoutWithHeaderFooter from '../layout-with-header-footer';
import LandingAboutUsContent from '../landing/about-us/page';

export const metadata: Metadata = {
  title: 'عن الشركة - UmrahGo',
  description: 'تعرف على منصة UmrahGo ورسالتنا في تقديم خدمات العمرة الميسرة',
};

// This is a public page - no authentication required
export default function AboutUsPage() {
  return (
    <LayoutWithHeaderFooter>
      <LandingAboutUsContent />
    </LayoutWithHeaderFooter>
  );
} 