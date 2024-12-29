'use client';

import { useRouter } from 'next/dist/client/components/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ImageUpload } from '@/components/image-upload';

interface EditRoomPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Room {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  home: {
    id: string;
    name: string;
  };
}

export default function EditRoomPage({ params }: EditRoomPageProps) {
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

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
      setImages(data.images || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch room');
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRoom();
    }
  }, [id, fetchRoom]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      images,
    };

    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update room');
      }

      router.push(`/rooms/${id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update room');
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete() {
    if (
      !window.confirm('Are you sure you want to delete this room? This action cannot be undone.')
    ) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete room');
      }

      router.push(`/homes/${room?.home.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete room');
      setIsDeleting(false);
    }
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Edit Room</h1>

      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={onSubmit}
          className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Room Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={room.name}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Living Room"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                (Supports markdown: **bold**, *italic*, - lists, etc.)
              </span>
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={room.description || ''}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
              placeholder="Add a description of the room using markdown...
Example:
**Key features:**
- Feature 1
- Feature 2

Visit https://example.com"
            />
          </div>

          <ImageUpload images={images} onImagesChange={setImages} />

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 border border-transparent rounded-md hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Room'}
            </button>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
