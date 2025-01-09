'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { ImageGallery } from '@/components/image-gallery';
import { MarkdownContent } from '@/components/markdown-content';
import { hasWriteAccess } from '@/lib/permissions';

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
    owner: {
      id: string;
    };
    shares: Array<{
      role: 'READ' | 'WRITE';
      user: {
        id: string;
      };
    }>;
  };
}

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

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

  const canEdit = hasWriteAccess(session?.user?.id, room.home);

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
        {canEdit && (
          <Link
            href={`/rooms/${room.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Room
          </Link>
        )}
      </div>

      {room.images && room.images.length > 0 && (
        <div className="mb-8">
          <ImageGallery images={room.images} homeId={room.home.id} />
        </div>
      )}

      {room.description && (
        <div className="mb-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Description</h2>
          <div className="text-gray-600 dark:text-gray-300">
            <MarkdownContent content={room.description} />
          </div>
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
          <p className="text-gray-600 dark:text-gray-300">
            {canEdit ? 'Manage items in this room' : 'View items in this room'}
          </p>
        </Link>

        <Link
          href={`/rooms/${room.id}/tasks`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Tasks</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {canEdit ? 'View and manage room tasks' : 'View room tasks'}
          </p>
        </Link>

        <Link
          href={`/rooms/${room.id}/paint`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Paint</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {canEdit ? 'Track paint colors and finishes' : 'View paint colors and finishes'}
          </p>
        </Link>
      </div>
    </div>
  );
}
