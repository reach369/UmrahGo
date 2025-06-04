import { redirect } from 'next/navigation';

export default function HowItWorks({ params }: { params: { locale: string } }) {
  const { locale } = params;
  redirect(`/${locale}/landing/how-it-works`);
}