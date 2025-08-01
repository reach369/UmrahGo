// Import metadata from the dedicated file
export { metadata, viewport } from './metadata';

import LayoutWithHeaderFooter from './layout-with-header-footer';
import LandingHomeContent from './landing/home/page';

// This is a public page - no authentication required
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  // Await the params
  const { locale } = await params;
  
  return (
    <LayoutWithHeaderFooter>
      <LandingHomeContent />
    </LayoutWithHeaderFooter>
  );
}