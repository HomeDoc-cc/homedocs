'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ShareHomeDialog } from '@/components/share-home-dialog';

interface HomePageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Home {
  id: string;
  name: string;
  address: string;
  images: string[];
  _count: {
    rooms: number;
    tasks: number;
    items: number;
  };
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export default function HomePage({ params }: HomePageProps) {
  const [home, setHome] = useState<Home | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  useEffect(() => {
    async function getParams() {
      const { id } = await params;
      setId(id);
    }
    getParams();
  }, [params]);

  const fetchHome = useCallback(async () => {
    try {
      const response = await fetch(`/api/homes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch home');
      }
      const data = await response.json();
      setHome(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch home');
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchHome();
    }
  }, [id, fetchHome]);

  // Fetch signed URLs for all images
  useEffect(() => {
    async function fetchUrls() {
      if (!home?.images) return;

      const urls: Record<string, string> = {};
      for (const key of home.images) {
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

    if (home?.images.some((key) => key && !imageUrls[key])) {
      fetchUrls();
    }
  }, [home?.images, refreshKey, imageUrls]);

  // Refresh URLs periodically (every 45 minutes to be safe with 1-hour expiration)
  useEffect(() => {
    if (!home?.images?.length) return;

    const interval = setInterval(
      () => {
        setRefreshKey((key) => key + 1);
      },
      45 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [home?.images?.length]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!home) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{home.name}</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsShareDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            Share
          </button>
          <Link
            href={`/homes/${home.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Edit Home
          </Link>
        </div>
      </div>

      <ShareHomeDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        homeId={home.id}
        onShare={() => {
          // Optionally refresh the home data to show updated sharing status
          fetchHome();
        }}
      />

      {home.images && home.images.length > 0 && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {home.images.filter(Boolean).map((key, index) => (
              <div key={`${key}-${index}`} className="relative aspect-video">
                {imageUrls[key] ? (
                  <Image
                    src={imageUrls[key]}
                    alt={`${home.name} - Image ${index + 1}`}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Details</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{home.address}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Owner</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {home.owner.name || home.owner.email}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Quick Stats</h2>
          <dl className="grid grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Rooms</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {home._count.rooms}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {home._count.items}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Tasks</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {home._count.tasks}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href={`/homes/${home.id}/rooms`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Rooms</h3>
          <p className="text-gray-600 dark:text-gray-300">Manage rooms and their contents</p>
        </Link>

        <Link
          href={`/homes/${home.id}/tasks`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Tasks</h3>
          <p className="text-gray-600 dark:text-gray-300">View and manage home tasks</p>
        </Link>

        <Link
          href={`/homes/${home.id}/paint`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Paint</h3>
          <p className="text-gray-600 dark:text-gray-300">Track paint colors and finishes</p>
        </Link>
      </div>
    </div>
  );
}
