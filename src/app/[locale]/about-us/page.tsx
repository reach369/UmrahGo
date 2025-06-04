import { redirect } from 'next/navigation';

export const metadata = {
  title: 'About Us',
  description: 'Learn more about UmrahGo',
};

export default function AboutUs({ params }: { params: { locale: string } }) {
  const { locale } = params;
  redirect(`/${locale}/landing/about-us`);
} 