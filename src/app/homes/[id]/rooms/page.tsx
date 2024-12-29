'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { MarkdownContent } from '@/components/markdown-content';
import { Home } from '@/types/prisma';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Room {
  id: string;
  name: string;
  description: string | null;
  _count: {
    items: number;
    tasks: number;
  };
}

export default function RoomsPage({ params }: PageProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);
  const [home, setHome] = useState<Home | null>(null);

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
      console.error('Failed to fetch home:', error);
    }
  }, [id]);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch(`/api/homes/${id}/rooms`);
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch rooms');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      void fetchRooms();
      void fetchHome();
    }
  }, [id, fetchRooms, fetchHome]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {home?.name || 'Loading...'} Rooms
        </h1>
        <Link
          href={`/homes/${id}/rooms/new`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Add Room
        </Link>
      </div>

      {error && <div className="text-red-500 text-center mb-8">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/rooms/${room.id}`}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {room.name}
                </h3>
                {room.description && (
                  <div className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    <MarkdownContent content={room.description} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{room._count.items} Items</span>
              <span>{room._count.tasks} Tasks</span>
            </div>
          </Link>
        ))}

        {rooms.length === 0 && (
          <div className="col-span-full text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300">No rooms added yet.</p>
            <Link
              href={`/homes/${id}/rooms/new`}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-2 inline-block"
            >
              Add your first room
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
