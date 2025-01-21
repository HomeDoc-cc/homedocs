'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Paint {
  id: string;
  name: string;
  brand: string | null;
  color: string | null;
  finish: string | null;
  code: string | null;
  location: string | null;
  hexColor: string | null;
}

interface PaintColorsProps {
  homeId?: string;
  roomId?: string;
}

function getDisplayColor(paint: Paint): string {
  if (paint.hexColor) return paint.hexColor;
  if (!paint.color) return '#E5E7EB';
  
  // If it's already a hex color, return it
  if (paint.color.startsWith('#')) return paint.color;
  
  // If it's a named color (e.g., "red", "blue"), return it
  const namedColors = ['white', 'black', 'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'brown', 'gray'];
  if (namedColors.includes(paint.color.toLowerCase())) return paint.color;
  
  // Otherwise, treat it as a hex color without the #
  return `#${paint.color}`;
}

export function PaintColors({ homeId, roomId }: PaintColorsProps) {
  const [paints, setPaints] = useState<Paint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPaints() {
      try {
        const response = await fetch(
          `/api/homes/${homeId}/paint${roomId ? `?roomId=${roomId}` : ''}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch paint colors');
        }
        const data = await response.json();
        setPaints(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch paint colors');
      } finally {
        setIsLoading(false);
      }
    }

    if (homeId) {
      void fetchPaints();
    }
  }, [homeId, roomId]);

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-gray-600 dark:text-gray-400">Loading paint colors...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Paint Colors</h3>
        <Link
          href={`/homes/${homeId}${roomId ? `/rooms/${roomId}` : ''}/paint`}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Manage Paint Colors
        </Link>
      </div>

      {paints.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No paint colors added yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {paints.map((paint) => (
            <div key={paint.id} className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: getDisplayColor(paint) }}
              />
              <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{paint.name}</span>
              {paint.brand && (
                <span className="text-xs text-gray-500 dark:text-gray-500">{paint.brand}</span>
              )}
              {paint.code && (
                <span className="text-xs text-gray-500 dark:text-gray-500">{paint.code}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
