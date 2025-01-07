'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { HomeShares } from '@/components/home-shares';
import { ImageGallery } from '@/components/image-gallery';
import { ShareHomeDialog } from '@/components/share-home-dialog';
import { hasWriteAccess } from '@/lib/permissions';

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
  shares: Array<{
    role: 'READ' | 'WRITE';
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
  pendingShares: Array<{
    email: string;
    role: 'READ' | 'WRITE';
    createdAt: Date;
    expiresAt: Date;
  }>;
}

export default function HomePage({ params }: HomePageProps) {
  const { data: session } = useSession();
  const [home, setHome] = useState<Home | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
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

  const canEdit = hasWriteAccess(session?.user?.id, home);
  const isOwner = session?.user?.id === home.owner.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{home.name}</h1>
        <div className="flex space-x-4">
          {isOwner && (
            <button
              onClick={() => setIsShareDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
              Share
            </button>
          )}
          {canEdit && (
            <Link
              href={`/homes/${home.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Edit Home
            </Link>
          )}
        </div>
      </div>

      <ImageGallery className="mb-8" images={home.images} homeId={home.id} />

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

      {isOwner && (
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <HomeShares
            shares={home.shares}
            pendingShares={home.pendingShares}
            isOwner={isOwner}
            homeId={home.id}
            onUpdate={() => {
              // Optionally trigger a server-side revalidation if needed
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href={`/homes/${home.id}/rooms`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Rooms</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {canEdit ? 'Manage rooms and their contents' : 'View rooms and their contents'}
          </p>
        </Link>

        <Link
          href={`/homes/${home.id}/tasks`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Tasks</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {canEdit ? 'View and manage home tasks' : 'View home tasks'}
          </p>
        </Link>

        <Link
          href={`/homes/${home.id}/paint`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Paint</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {canEdit ? 'Track paint colors and finishes' : 'View paint colors and finishes'}
          </p>
        </Link>
      </div>

      <ShareHomeDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        homeId={home?.id}
      />
    </div>
  );
}
