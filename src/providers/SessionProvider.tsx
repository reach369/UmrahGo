'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function PersistentSessionProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // On server side, just render children
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <NextAuthSessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
} 