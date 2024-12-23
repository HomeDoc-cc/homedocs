'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface RoomPageProps {
  params: {
    id: string;
  };
}

interface Room {
  id: string;
  name: string;
  description: string | null;
  home: {
    id: string;
    name: string;
  };
  _count: {
    items: number;
    tasks: number;
    paint: number;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoom();
  }, [params.id]);

  async function fetchRoom() {
    try {
      const response = await fetch(`/api/rooms/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch room");
      }
      const data = await response.json();
      setRoom(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch room");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error || "Room not found"}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href={`/homes/${room.home.id}/rooms`}
          className="text-blue-500 hover:text-blue-600"
        >
          ← Back to {room.home.name}
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{room.name}</h1>
        <div className="space-x-4">
          <Link
            href={`/rooms/${room.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Edit Room
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Details</h2>
          <dl className="space-y-2">
            {room.description && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{room.description}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <dl className="grid grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Items</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {room._count.items}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tasks</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {room._count.tasks}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Paint Colors</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {room._count.paint}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href={`/rooms/${room.id}/items`}
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Items</h3>
          <p className="text-gray-600">Manage items in this room</p>
        </Link>

        <Link
          href={`/rooms/${room.id}/tasks`}
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Tasks</h3>
          <p className="text-gray-600">View and manage room tasks</p>
        </Link>

        <Link
          href={`/rooms/${room.id}/paint`}
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Paint</h3>
          <p className="text-gray-600">Track paint colors and finishes</p>
        </Link>
      </div>
    </div>
  );
} 