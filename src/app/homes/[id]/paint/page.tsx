'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

import { PaintList } from '@/components/paint/paint-list';
import { PaintModal } from '@/components/paint/paint-modal';

import { type Paint as PrismaPaint } from '.prisma/client';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaint, setSelectedPaint] = useState<PrismaPaint>();
  const [paints, setPaints] = useState<PrismaPaint[]>([]);

  // Fetch paints on component mount
  useEffect(() => {
    void fetchPaints();
  }, [id]);

  const fetchPaints = async () => {
    try {
      const response = await fetch(`/api/homes/${id}/paint`);
      if (!response.ok) {
        throw new Error('Failed to fetch paint');
      }
      const data = await response.json();
      setPaints(data);
    } catch (error) {
      console.error('Failed to fetch paint:', error);
    }
  };

  const handleSubmit = async (data: Partial<PrismaPaint>) => {
    try {
      if (selectedPaint) {
        const response = await fetch(`/api/paint/${selectedPaint.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update paint');
        }
      } else {
        const response = await fetch(`/api/homes/${id}/paint`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to create paint');
        }
      }

      setIsModalOpen(false);
      setSelectedPaint(undefined);
      await fetchPaints();
    } catch (error) {
      console.error('Failed to save paint:', error);
    }
  };

  const handleEdit = (paint?: PrismaPaint) => {
    setSelectedPaint(paint);
    setIsModalOpen(true);
  };

  const handleDelete = async (paint: PrismaPaint) => {
    try {
      const response = await fetch(`/api/paint/${paint.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete paint');
      }

      await fetchPaints();
    } catch (error) {
      console.error('Failed to delete paint:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Paint</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back
          </button>
          <button
            onClick={() => handleEdit()}
            className="rounded-md border border-transparent bg-blue-600 dark:bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Paint
          </button>
        </div>
      </div>

      {paints && paints.length > 0 ? (
        <PaintList paints={paints} onEdit={handleEdit} onDelete={handleDelete} />
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No paint found.</p>
          <button
            onClick={() => handleEdit()}
            className="mt-4 rounded-md border border-transparent bg-blue-600 dark:bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Paint
          </button>
        </div>
      )}

      <PaintModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPaint(undefined);
        }}
        onSubmit={handleSubmit}
        paint={selectedPaint}
      />
    </div>
  );
}
