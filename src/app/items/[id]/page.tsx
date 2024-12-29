'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { MarkdownContent } from '@/components/markdown-content';

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
    };
  };
  _count: {
    tasks: number;
  };
}

export default function ItemPage({ params }: ItemPageProps) {
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageKey, setSelectedImageKey] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);
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
      if (data.images && data.images.length > 0) {
        setSelectedImageKey(data.images[0]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch item');
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id, fetchItem]);

  // Fetch signed URLs for all images
  useEffect(() => {
    async function fetchUrls() {
      if (!item?.images) return;

      const urls: Record<string, string> = {};
      for (const key of item.images) {
        if (!key) continue;
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

    if (item?.images.some((key) => key && !imageUrls[key])) {
      fetchUrls();
    }
  }, [item?.images, refreshKey, imageUrls]);

  // Refresh URLs periodically (every 45 minutes to be safe with 1-hour expiration)
  useEffect(() => {
    if (!item?.images?.length) return;

    const interval = setInterval(
      () => {
        setRefreshKey((key) => key + 1);
      },
      45 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [item?.images?.length]);

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
        <Link
          href={`/items/${item.id}/edit`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit Item
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          {item.images.length > 0 ? (
            <>
              <div className="relative aspect-square">
                {selectedImageKey && imageUrls[selectedImageKey] ? (
                  <Image
                    src={imageUrls[selectedImageKey]}
                    alt={item.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Loading...</span>
                  </div>
                )}
              </div>
              {item.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {item.images.filter(Boolean).map((key, index) => (
                    <button
                      key={`${key}-${index}`}
                      onClick={() => setSelectedImageKey(key)}
                      className={`relative aspect-square ${
                        selectedImageKey === key ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                      }`}
                    >
                      {imageUrls[key] ? (
                        <Image
                          src={imageUrls[key]}
                          alt={`${item.name} thumbnail ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">Loading...</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
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

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Tasks</h2>
            <p className="text-gray-600 dark:text-gray-400">View and manage tasks for this item</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
              {item._count.tasks}
            </span>
            <Link
              href={`/tasks/new?itemId=${item.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Add Task
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
