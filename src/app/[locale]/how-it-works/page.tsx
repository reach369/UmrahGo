import { getTranslations } from 'next-intl/server';
import LayoutWithHeaderFooter from '../layout-with-header-footer';
import LandingHowItWorksContent from '../landing/how-it-works/page';
import { locales } from '@/i18n';

type Props = {
  params: Promise<{ locale: typeof locales[number] }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'howItWorks.meta' });
 
  return {
    title: t('title'),
    description: t('description')
  };
}

// This is a public page - no authentication required
export default function HowItWorksPage() {
  return (
    <LayoutWithHeaderFooter>
      <LandingHowItWorksContent />
    </LayoutWithHeaderFooter>
  );
}