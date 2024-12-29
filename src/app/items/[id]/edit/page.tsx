'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ItemForm, ItemFormData } from '@/components/items/item-form';

interface EditItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Item {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  manufacturer?: string | null;
  modelNumber?: string | null;
  serialNumber?: string | null;
  purchaseDate?: string | null;
  warrantyUntil?: string | null;
  manualUrl?: string | null;
  roomId: string;
  images: string[];
}

export default function EditItemPage({ params }: EditItemPageProps) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (data: ItemFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
          warrantyUntil: data.warrantyUntil
            ? new Date(data.warrantyUntil).toISOString()
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      router.push(`/items/${id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update item');
      setIsLoading(false);
    }
  };

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Convert the item data to match the form data structure
  const formData: ItemFormData = {
    name: item.name,
    description: item.description || undefined,
    category: item.category || undefined,
    manufacturer: item.manufacturer || undefined,
    modelNumber: item.modelNumber || undefined,
    serialNumber: item.serialNumber || undefined,
    purchaseDate: item.purchaseDate || undefined,
    warrantyUntil: item.warrantyUntil || undefined,
    manualUrl: item.manualUrl || undefined,
    images: item.images,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Edit Item</h1>

      <div className="max-w-2xl mx-auto">
        <ItemForm
          initialData={formData}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={isLoading}
          submitLabel="Save Changes"
        />
        {error && <div className="mt-4 text-red-500 text-sm text-center">{error}</div>}
      </div>
    </div>
  );
}
