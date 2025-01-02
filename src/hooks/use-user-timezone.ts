import { useEffect, useState } from 'react';

export function useUserTimezone() {
  const [timezone, setTimezone] = useState<string>('UTC');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimezone() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/settings/timezone');
        if (!response.ok) {
          throw new Error('Failed to fetch timezone');
        }
        const data = await response.json();
        setTimezone(data.timezone);
      } catch (error) {
        console.error('Error fetching timezone:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch timezone');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTimezone();
  }, []);

  return { timezone, isLoading, error };
} 