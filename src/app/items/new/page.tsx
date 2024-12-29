'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { ItemForm, ItemFormData } from '@/components/items/item-form';

export default function NewItemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if no roomId is provided
  if (!roomId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please select a room first.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: ItemFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/rooms/${roomId}/items`, {
        method: 'POST',
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
        throw new Error('Failed to create item');
      }

      const item = await response.json();
      router.push(`/items/${item.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create item');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Item</h1>

      <div className="max-w-2xl mx-auto">
        <ItemForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={isLoading}
          submitLabel="Create Item"
        />
        {error && <div className="mt-4 text-red-500 text-sm text-center">{error}</div>}
      </div>
    </div>
  );
}
