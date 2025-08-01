'use client';
import { useTranslations } from 'next-intl';

export default function LicenseAgreementPage() {
  const t = useTranslations('LicenseAgreement');

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center">{t('title')}</h1>
      <div className="prose max-w-4xl mx-auto">
        <p className="text-lg text-center mb-6">{t('lastUpdated')}</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">{t('introduction.title')}</h2>
        <p>{t('introduction.content')}</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">{t('licenseGrant.title')}</h2>
        <p>{t('licenseGrant.content')}</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">{t('restrictions.title')}</h2>
        <p>{t('restrictions.content')}</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>{t('restrictions.points.reverseEngineer')}</li>
          <li>{t('restrictions.points.multipleUsers')}</li>
          <li>{t('restrictions.points.rentLease')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">{t('termination.title')}</h2>
        <p>{t('termination.content')}</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">{t('contact.title')}</h2>
        <p>{t('contact.content')}</p>
      </div>
    </div>
  );
} 