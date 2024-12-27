'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PaintList } from '@/components/paint/paint-list';
import { PaintModal } from '@/components/paint/paint-modal';

import { type Paint as PrismaPaint } from '.prisma/client';

interface PaintPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface PaintFormData {
  name: string;
  brand: string;
  color: string;
  finish: string;
  code?: string | null;
  location?: string | null;
  notes?: string | null;
}

export default function PaintPage({ params }: PaintPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaint, setSelectedPaint] = useState<PrismaPaint | undefined>(undefined);
  const [paints, setPaints] = useState<PrismaPaint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    async function getParams() {
      const { id } = await params;
      setId(id);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    if (id) {
      fetchPaints();
    }
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
      setError(error instanceof Error ? error.message : 'Failed to fetch paint');
    }
  };

  const handleCreatePaint = async (data: PaintFormData) => {
    try {
      const response = await fetch(`/api/homes/${id}/paint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create paint entry');
      }

      await fetchPaints();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating paint entry:', error);
    }
  };

  const handleEditPaint = async (data: PaintFormData) => {
    if (!selectedPaint) return;

    try {
      const response = await fetch(`/api/paint/${selectedPaint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update paint entry');
      }

      await fetchPaints();
      setIsModalOpen(false);
      setSelectedPaint(undefined);
    } catch (error) {
      console.error('Error updating paint entry:', error);
    }
  };

  const handleDeletePaint = async (paint: PrismaPaint) => {
    if (!confirm('Are you sure you want to delete this paint entry?')) return;

    try {
      const response = await fetch(`/api/paint/${paint.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete paint entry');
      }

      await fetchPaints();
    } catch (error) {
      console.error('Error deleting paint entry:', error);
    }
  };

  const handleOpenModal = (paint?: PrismaPaint) => {
    setSelectedPaint(paint);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPaint(undefined);
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Home Paint</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Paint
        </button>
      </div>

      <PaintList paints={paints} onEdit={handleOpenModal} onDelete={handleDeletePaint} />

      <PaintModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        paint={selectedPaint}
        onSubmit={selectedPaint ? handleEditPaint : handleCreatePaint}
      />
    </div>
  );
}
