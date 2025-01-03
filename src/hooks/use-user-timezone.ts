import { useCallback, useEffect, useRef, useState } from 'react';

export function useUserTimezone() {
  const [timezone, setTimezone] = useState<string>('UTC');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedTimezone = useRef(false);

  const fetchTimezone = useCallback(async () => {
    if (hasFetchedTimezone.current) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/settings/timezone');
      if (!response.ok) {
        throw new Error('Failed to fetch timezone');
      }
      const data = await response.json();
      setTimezone(data.timezone);
      hasFetchedTimezone.current = true;
    } catch (error) {
      console.error('Error fetching timezone:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch timezone');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimezone();
    return () => {
      hasFetchedTimezone.current = false;
    };
  }, [fetchTimezone]);

  return { 
    timezone, 
    isLoading, 
    error,
    refetch: useCallback(() => {
      hasFetchedTimezone.current = false;
      setIsLoading(true);
      fetchTimezone();
    }, [fetchTimezone])
  };
} 