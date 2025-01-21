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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Paints</h3>
        <Link
          href={roomId ? `/rooms/${roomId}/paint` : `/homes/${homeId}/paint`}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Manage Paints
        </Link>
      </div>

      {paints.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No paints added yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {paints.map((paint) => (
            <div key={paint.id} className="flex flex-col">
              <div
                className="w-24 h-24 border-2 rounded-lg border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: paint.hexColor || '#E5E7EB' }}
              />
              <div className="hidden">
                <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">{paint.name}</span>
                {paint.brand && (
                  <span className="text-xs text-gray-500 dark:text-gray-500">{paint.brand}</span>
                )}
                {paint.code && (
                  <span className="text-xs text-gray-500 dark:text-gray-500">{paint.code}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
