import { useQuery } from '@tanstack/react-query';

interface ColorData {
  code: string;
  name: string;
  brand: string;
  hex: string;
  rgbR: number;
  rgbG: number;
  rgbB: number;
}

export function useColor(code: string | null | undefined) {
  return useQuery<ColorData>({
    queryKey: ['color', code],
    queryFn: async () => {
      if (!code) throw new Error('No color code provided');
      const response = await fetch(`/api/colors/${code}`);
      if (!response.ok) throw new Error('Failed to fetch color');
      const data = await response.json();
      return {
        code: data.code,
        name: data.name,
        brand: data.brand,
        hex: data.hex,
        rgbR: data.rgb.r,
        rgbG: data.rgb.g,
        rgbB: data.rgb.b,
      };
    },
    enabled: !!code,
  });
}
