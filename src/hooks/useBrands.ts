import { useQuery } from '@tanstack/react-query';

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await fetch('/api/colors/brands');
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      return response.json() as Promise<string[]>;
    },
  });
}
