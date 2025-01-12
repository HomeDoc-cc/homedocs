'use client';

import { SessionProvider } from 'next-auth/react';

import { ToastProvider } from '@/components/ui/toast';
import { TimezoneProvider } from '@/contexts/timezone-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TimezoneProvider>
        <ToastProvider>{children}</ToastProvider>
      </TimezoneProvider>
    </SessionProvider>
  );
}
