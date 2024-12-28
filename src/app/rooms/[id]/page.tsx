'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface RoomPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Room {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  _count: {
    items: number;
    tasks: number;
  };
  home: {
    id: string;
    name: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function getParams() {
      const { id } = await params;
      setId(id);
    }
    getParams();
  }, [params]);

  const fetchRoom = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch room');
      }
      const data = await response.json();
      setRoom(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch room');
    }
  }, [id]);
  useEffect(() => {
    if (id) {
      void fetchRoom();
    }
  }, [id, fetchRoom]);

  // Fetch signed URLs for all images
  useEffect(() => {
    async function fetchUrls() {
      if (!room?.images) return;

      const urls: Record<string, string> = {};
      for (const key of room.images) {
        if (!key) continue; // Skip undefined keys
        try {
          const response = await fetch(`/api/upload/url?key=${encodeURIComponent(key)}`);
          if (response.ok) {
            const { url } = await response.json();
            urls[key] = url;
          }
        } catch (error) {
          console.error('Error fetching URL:', error);
        }
      }
      setImageUrls((prev) => ({ ...prev, ...urls }));
    }

    if (room?.images.some((key) => key && !imageUrls[key])) {
      fetchUrls();
    }
  }, [room?.images, refreshKey, imageUrls]);

  // Refresh URLs periodically (every 45 minutes to be safe with 1-hour expiration)
  useEffect(() => {
    if (!room?.images?.length) return;

    const interval = setInterval(
      () => {
        setRefreshKey((key) => key + 1);
      },
      45 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [room?.images?.length]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{room.name}</h1>
          <Link
            href={`/homes/${room.home.id}`}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← {room.home.name}
          </Link>
        </div>
        <Link
          href={`/rooms/${room.id}/edit`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit Room
        </Link>
      </div>

      {room.images && room.images.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {room.images.filter(Boolean).map((key, index) => (
              <div key={`${key}-${index}`} className="relative aspect-video">
                {imageUrls[key] ? (
                  <Image
                    src={imageUrls[key]}
                    alt={`${room.name} - Image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Loading...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {room.description && (
        <div className="mb-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Description</h2>
          <p className="text-gray-600 dark:text-gray-300">{room.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Stats</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {room._count.items}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Tasks</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {room._count.tasks}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href={`/rooms/${room.id}/items`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Items</h3>
          <p className="text-gray-600 dark:text-gray-300">Manage items in this room</p>
        </Link>

        <Link
          href={`/rooms/${room.id}/tasks`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Tasks</h3>
          <p className="text-gray-600 dark:text-gray-300">View and manage room tasks</p>
        </Link>

        <Link
          href={`/rooms/${room.id}/paint`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Paint</h3>
          <p className="text-gray-600 dark:text-gray-300">Track paint colors and finishes</p>
        </Link>
      </div>
    </div>
  );
}
