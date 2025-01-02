'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface TimezoneContextType {
  timezone: string;
  isLoading: boolean;
  error: string | null;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTimezone] = useState<string>('UTC');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimezone() {
      try {
        const response = await fetch('/api/settings/timezone');
        if (!response.ok) {
          throw new Error('Failed to fetch timezone');
        }
        const data = await response.json();
        setTimezone(data.timezone);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch timezone');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTimezone();
  }, []);

  return (
    <TimezoneContext.Provider value={{ timezone, isLoading, error }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
} 