import { UserIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

export const getUserTypes = (t: (key: string) => string) => [
  {
    id: 'pilgrim',
    title: t('howItWorks.userTypes.pilgrim.title'),
    description: t('howItWorks.userTypes.pilgrim.description'),
    steps: [
      t('howItWorks.userTypes.pilgrim.steps.1'),
      t('howItWorks.userTypes.pilgrim.steps.2'),
      t('howItWorks.userTypes.pilgrim.steps.3'),
      t('howItWorks.userTypes.pilgrim.steps.4'),
      t('howItWorks.userTypes.pilgrim.steps.5'),
    ],
    icon: <UserIcon className="h-10 w-10 text-primary" />,
  },
  {
    id: 'office',
    title: t('howItWorks.userTypes.office.title'),
    description: t('howItWorks.userTypes.office.description'),
    steps: [
      t('howItWorks.userTypes.office.steps.1'),
      t('howItWorks.userTypes.office.steps.2'),
      t('howItWorks.userTypes.office.steps.3'),
      t('howItWorks.userTypes.office.steps.4'),
      t('howItWorks.userTypes.office.steps.5'),
    ],
    icon: <BuildingOffice2Icon className="h-10 w-10 text-primary" />,
  },
];

export const getFaqs = (t: (key: string) => string) => [
  {
    question: t('howItWorks.faqs.1.question'),
    answer: t('howItWorks.faqs.1.answer'),
  },
  {
    question: t('howItWorks.faqs.2.question'),
    answer: t('howItWorks.faqs.2.answer'),
  },
  {
    question: t('howItWorks.faqs.3.question'),
    answer: t('howItWorks.faqs.3.answer'),
  },
  {
    question: t('howItWorks.faqs.4.question'),
    answer: t('howItWorks.faqs.4.answer'),
  },
  {
    question: t('howItWorks.faqs.5.question'),
    answer: t('howItWorks.faqs.5.answer'),
  },
]; 