import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Contact Us',
  description: 'Contact UmrahGo for assistance',
};

export default function Contact({ params }: { params: { locale: string } }) {
  const { locale } = params;
  redirect(`/${locale}/landing/contact`);
} 