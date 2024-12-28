'use client';

import { use, useCallback, useEffect, useState } from 'react';

import { PaintList } from '@/components/paint/paint-list';
import { PaintModal } from '@/components/paint/paint-modal';

import { type Paint as PrismaPaint, type Room } from '.prisma/client';

interface PaintPageProps {
  params: Promise<{
    id: string;
  }>;
}

type PaintFormData = Partial<
  Omit<PrismaPaint, 'id' | 'createdAt' | 'updatedAt' | 'homeId' | 'roomId'>
>;

export default function PaintPage({ params }: PaintPageProps) {
  const { id } = use(params);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaint, setSelectedPaint] = useState<PrismaPaint | undefined>(undefined);
  const [paints, setPaints] = useState<PrismaPaint[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    void fetchRoom();
  }, [id, fetchRoom]);

  const fetchPaints = useCallback(async () => {
    if (!room?.homeId) return;

    try {
      const roomResponse = await fetch(`/api/rooms/${id}/paint`);
      if (!roomResponse.ok) {
        throw new Error('Failed to fetch room paint');
      }
      const roomPaints = await roomResponse.json();

      const homeResponse = await fetch(`/api/homes/${room.homeId}/paint`);
      if (!homeResponse.ok) {
        throw new Error('Failed to fetch home paint');
      }
      const homePaints = await homeResponse.json();

      setPaints([...roomPaints, ...homePaints.filter((paint: PrismaPaint) => !paint.roomId)]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch paint');
    }
  }, [id, room?.homeId]);

  useEffect(() => {
    if (room?.homeId) {
      void fetchPaints();
    }
  }, [id, room?.homeId, fetchPaints]);

  const handleCreatePaint = async (data: PaintFormData) => {
    try {
      const response = await fetch(`/api/rooms/${id}/paint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          roomId: id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create paint entry');
      }

      await fetchPaints();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating paint entry:', error);
      throw error;
    }
  };

  const handleEditPaint = async (data: PaintFormData) => {
    if (!selectedPaint) return;

    try {
      const response = await fetch(`/api/paint/${selectedPaint.id}`, {
        method: 'PATCH',
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
      throw error;
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {room?.name || 'Loading...'} Paint
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Paint
        </button>
        {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>}
      </div>

      <PaintList
        paints={paints}
        onEdit={handleOpenModal}
        onDelete={handleDeletePaint}
        roomName={room?.name}
      />

      <PaintModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        paint={selectedPaint}
        onSubmit={selectedPaint ? handleEditPaint : handleCreatePaint}
      />
    </div>
  );
}
