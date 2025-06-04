import { redirect } from 'next/navigation';

export default async function RootPage() {
  // Default to Arabic locale
  redirect('/ar/landing/home');
} 