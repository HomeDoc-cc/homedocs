'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface EditItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Item {
  id: string;
  name: string;
  description?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  roomId: string;
  images: string[];
}

export default function EditItemPage({ params }: EditItemPageProps) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<string[]>([]);
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
      setImages(data.images || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch item');
    }
  }, [id]);
  
  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id, fetchItem]);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length) return;

    setUploadingImages(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(event.target.files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const { url } = await response.json();
        newImages.push(url);
      }

      setImages([...images, ...newImages]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const purchasePrice = formData.get('purchasePrice') as string;
    const data = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || null,
      purchaseDate: (formData.get('purchaseDate') as string) || null,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      images: images,
    };

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      router.push(`/items/${id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update item');
    } finally {
      setIsLoading(false);
    }
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Edit Item</h1>

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
              Item Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={item.name}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Coffee Table"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={item.description || ''}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Add any additional details about the item"
            />
          </div>

          <div>
            <label
              htmlFor="purchaseDate"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Purchase Date
            </label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              defaultValue={item.purchaseDate ? item.purchaseDate.split('T')[0] : ''}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="purchasePrice"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Purchase Price
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                id="purchasePrice"
                name="purchasePrice"
                defaultValue={item.purchasePrice || ''}
                className="pl-7 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Images
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image}
                    alt={`Item image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block">
                <span className="sr-only">Choose images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    dark:file:bg-blue-900 dark:file:text-blue-300
                    hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                />
              </label>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadingImages}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
