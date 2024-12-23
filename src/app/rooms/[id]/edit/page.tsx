'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface EditRoomPageProps {
  params: {
    id: string;
  };
}

interface Room {
  id: string;
  name: string;
  description?: string | null;
  homeId: string;
}

export default function EditRoomPage({ params }: EditRoomPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || null,
    };

    try {
      const response = await fetch(`/api/rooms/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update room");
      }

      router.push(`/rooms/${params.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update room");
    } finally {
      setIsLoading(false);
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
      <h1 className="text-3xl font-bold mb-8">Edit Room</h1>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Room Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={room.name}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Living Room"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={room.description || ""}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add any additional details about the room"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 