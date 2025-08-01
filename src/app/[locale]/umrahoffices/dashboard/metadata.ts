import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations('Metadata');
  return { title: t('umrahOfficesAdmin') || 'لوحة تحكم مكتب العمرة' };
} 