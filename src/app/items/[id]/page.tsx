'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ImageGallery } from '@/components/image-gallery';
import { MarkdownContent } from '@/components/markdown-content';
import { TaskList } from '@/components/tasks/task-list';
import { useTaskData } from '@/hooks/use-task-data';
import { hasWriteAccess } from '@/lib/permissions';

interface ItemPageProps {
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
  images: string[];
  room: {
    id: string;
    name: string;
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
  };
  _count: {
    tasks: number;
  };
}

export default function ItemPage({ params }: ItemPageProps) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => redirect('/auth/signin'),
  });
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    async function getParams() {
      const { id } = await params;
      setId(id);
    }
    getParams();
  }, [params]);

  const fetchItem = useCallback(async () => {
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch item');
      }
      const data = await response.json();
      setItem(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch item');
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id, fetchItem]);

  const { tasks, users, isLoading: isLoadingTasks, refetch } = useTaskData({
    type: 'item',
    id: id || undefined,
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const canEdit = hasWriteAccess(session?.user?.id, item.room.home);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{item.name}</h1>
          <Link
            href={`/rooms/${item.room.id}`}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← {item.room.name}
          </Link>
        </div>
        {canEdit && (
          <Link
            href={`/items/${item.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Item
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {item.images.length > 0 ? (
            <ImageGallery images={item.images} homeId={item.room.home.id} />
          ) : (
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">No images available</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Details</h2>
            <dl className="space-y-2">
              {item.description && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    <MarkdownContent content={item.description} />
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                  {item.room.home.name} - {item.room.name}
                </dd>
              </div>
              {item.category && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">{item.category}</dd>
                </div>
              )}
              {item.purchaseDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Purchase Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {new Date(item.purchaseDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {item.warrantyUntil && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Warranty Until
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {new Date(item.warrantyUntil).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Product Information
            </h2>
            <dl className="space-y-2">
              {item.manufacturer && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Manufacturer
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {item.manufacturer}
                  </dd>
                </div>
              )}
              {item.modelNumber && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Model Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {item.modelNumber}
                  </dd>
                </div>
              )}
              {item.serialNumber && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Serial Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    {item.serialNumber}
                  </dd>
                </div>
              )}
              {item.manualUrl && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Manual</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                    <a
                      href={item.manualUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Manual
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {canEdit ? 'View and manage tasks for this item' : 'View tasks for this item'}
          </p>
        </div>

        <TaskList
          tasks={tasks}
          users={users}
          onTasksChange={refetch}
          isLoading={isLoadingTasks}
          canEdit={() => canEdit}
          canCreateTask={canEdit}
          defaultHomeId={item.room.home.id}
          defaultRoomId={item.room.id}
          defaultItemId={item.id}
        />
      </div>
    </div>
  );
}
