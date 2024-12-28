'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { FlooringList } from '@/components/flooring/flooring-list';
import { FlooringModal } from '@/components/flooring/flooring-modal';

import { type Flooring as PrismaFlooring } from '.prisma/client';

interface RoomFlooringPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface FlooringFormData {
  name: string;
  type: string;
  material: string;
  brand: string;
  color?: string | null;
  pattern?: string | null;
  notes?: string | null;
}

export default function RoomFlooringPage({ params }: RoomFlooringPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlooring, setSelectedFlooring] = useState<PrismaFlooring | undefined>(undefined);
  const [floorings, setFloorings] = useState<PrismaFlooring[]>([]);
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
      fetchFloorings();
    }
  }, [id]);

  const fetchFloorings = async () => {
    try {
      const response = await fetch(`/api/rooms/${id}/flooring`);
      if (!response.ok) {
        throw new Error('Failed to fetch flooring');
      }
      const data = await response.json();
      setFloorings(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch flooring');
    }
  };

  const handleCreateFlooring = async (data: FlooringFormData) => {
    try {
      const response = await fetch(`/api/rooms/${id}/flooring`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create flooring entry');
      }

      await fetchFloorings();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating flooring entry:', error);
    }
  };

  const handleEditFlooring = async (data: FlooringFormData) => {
    if (!selectedFlooring) return;

    try {
      const response = await fetch(`/api/flooring/${selectedFlooring.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update flooring entry');
      }

      await fetchFloorings();
      setIsModalOpen(false);
      setSelectedFlooring(undefined);
    } catch (error) {
      console.error('Error updating flooring entry:', error);
    }
  };

  const handleDeleteFlooring = async (flooring: PrismaFlooring) => {
    if (!confirm('Are you sure you want to delete this flooring entry?')) return;

    try {
      const response = await fetch(`/api/flooring/${flooring.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flooring entry');
      }

      await fetchFloorings();
    } catch (error) {
      console.error('Error deleting flooring entry:', error);
    }
  };

  const handleOpenModal = (flooring?: PrismaFlooring) => {
    setSelectedFlooring(flooring);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedFlooring(undefined);
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Room Flooring</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Flooring
        </button>
      </div>

      <FlooringList
        floorings={floorings}
        onEdit={handleOpenModal}
        onDelete={handleDeleteFlooring}
      />

      <FlooringModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        flooring={selectedFlooring}
        onSubmit={selectedFlooring ? handleEditFlooring : handleCreateFlooring}
      />
    </div>
  );
}
