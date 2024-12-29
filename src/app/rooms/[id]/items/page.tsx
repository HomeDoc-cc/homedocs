'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { MarkdownContent } from '@/components/markdown-content';

interface ItemsPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Item {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  manufacturer: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  warrantyUntil: string | null;
  manualUrl: string | null;
}

interface Room {
  id: string;
  name: string;
  home: {
    id: string;
    name: string;
  };
}

export default function ItemsPage({ params }: ItemsPageProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/${id}/items`);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRoom();
      fetchItems();
    }
  }, [id, fetchRoom, fetchItems]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error || 'Room not found'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Items in {room.name}</h1>
          <Link
            href={`/rooms/${room.id}`}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← {room.name}
          </Link>
        </div>
        <Link
          href={`/items/new?roomId=${room.id}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Add Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by adding a new item to this room.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="block bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {item.name}
              </h3>
              {item.description && (
                <div className="text-gray-600 dark:text-gray-300 mb-4">
                  <MarkdownContent content={item.description} />
                </div>
              )}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {item.category && (
                  <>
                    <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                    <dd className="text-gray-900 dark:text-white">{item.category}</dd>
                  </>
                )}
                {item.manufacturer && (
                  <>
                    <dt className="text-gray-500 dark:text-gray-400">Manufacturer</dt>
                    <dd className="text-gray-900 dark:text-white">{item.manufacturer}</dd>
                  </>
                )}
                {item.modelNumber && (
                  <>
                    <dt className="text-gray-500 dark:text-gray-400">Model</dt>
                    <dd className="text-gray-900 dark:text-white">{item.modelNumber}</dd>
                  </>
                )}
              </dl>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
