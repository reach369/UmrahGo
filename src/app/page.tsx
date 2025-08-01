import { redirect } from 'next/navigation';

export default async function RootPage() {
  // Default to Arabic locale - redirect to main home page
  redirect('/ar');
} 