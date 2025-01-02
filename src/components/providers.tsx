'use client';

import { SessionProvider } from 'next-auth/react';

import { TimezoneProvider } from '@/contexts/timezone-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TimezoneProvider>{children}</TimezoneProvider>
    </SessionProvider>
  );
}
