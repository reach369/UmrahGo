'use client';
import { useTranslations } from 'next-intl';

export default function CookiePolicyPage() {
  const t = useTranslations('CookiePolicy');

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">{t('title')}</h1>
      <div className="prose max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mt-6 mb-4">{t('whatAreCookies.title')}</h2>
        <p>{t('whatAreCookies.content')}</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">{t('howWeUseCookies.title')}</h2>
        <p>{t('howWeUseCookies.content')}</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>{t('howWeUseCookies.points.essential')}</li>
          <li>{t('howWeUseCookies.points.performance')}</li>
          <li>{t('howWeUseCookies.points.functionality')}</li>
          <li>{t('howWeUseCookies.points.advertising')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">{t('managingCookies.title')}</h2>
        <p>{t('managingCookies.content')}</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">{t('moreInfo.title')}</h2>
        <p>{t('moreInfo.content')}</p>
      </div>
    </div>
  );
} 