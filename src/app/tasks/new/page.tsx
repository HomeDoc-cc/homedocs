'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface TaskFormData {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  assigneeId?: string;
  homeId?: string;
  roomId?: string;
  itemId?: string;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface Home {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
  homeId: string;
}

interface Item {
  id: string;
  name: string;
  roomId: string;
}

export default function NewTaskPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const homeId = searchParams.get("homeId");
  const roomId = searchParams.get("roomId");
  const itemId = searchParams.get("itemId");

  const [users, setUsers] = useState<User[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    if (!homeId && !roomId && !itemId) {
      fetchHomes();
    }
  }, []);

  useEffect(() => {
    if (homeId) {
      fetchRoomsByHome(homeId);
    }
  }, [homeId]);

  useEffect(() => {
    if (roomId) {
      fetchItemsByRoom(roomId);
    }
  }, [roomId]);

  async function fetchUsers() {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function fetchHomes() {
    try {
      const response = await fetch("/api/homes");
      if (!response.ok) throw new Error("Failed to fetch homes");
      const data = await response.json();
      setHomes(data);
    } catch (error) {
      console.error("Error fetching homes:", error);
    }
  }

  async function fetchRoomsByHome(homeId: string) {
    try {
      const response = await fetch(`/api/homes/${homeId}/rooms`);
      if (!response.ok) throw new Error("Failed to fetch rooms");
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }

  async function fetchItemsByRoom(roomId: string) {
    try {
      const response = await fetch(`/api/rooms/${roomId}/items`);
      if (!response.ok) throw new Error("Failed to fetch items");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data: TaskFormData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      priority: formData.get("priority") as TaskFormData["priority"],
      status: formData.get("status") as TaskFormData["status"],
      dueDate: formData.get("dueDate") as string || undefined,
      assigneeId: formData.get("assigneeId") as string || undefined,
      homeId: homeId || (formData.get("homeId") as string),
      roomId: roomId || (formData.get("roomId") as string),
      itemId: itemId || (formData.get("itemId") as string),
    };

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const task = await response.json();
      router.push(`/tasks/${task.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create task");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Task</h1>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Fix leaky faucet"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add any additional details about the task"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority *
              </label>
              <select
                id="priority"
                name="priority"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700">
                Assignee
              </label>
              <select
                id="assigneeId"
                name="assigneeId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an assignee</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!homeId && !roomId && !itemId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="homeId" className="block text-sm font-medium text-gray-700">
                  Home
                </label>
                <select
                  id="homeId"
                  name="homeId"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onChange={(e) => fetchRoomsByHome(e.target.value)}
                >
                  <option value="">Select a home</option>
                  {homes.map((home) => (
                    <option key={home.id} value={home.id}>
                      {home.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                  Room
                </label>
                <select
                  id="roomId"
                  name="roomId"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onChange={(e) => fetchItemsByRoom(e.target.value)}
                >
                  <option value="">Select a room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {(roomId || (!homeId && !roomId && !itemId)) && (
            <div>
              <label htmlFor="itemId" className="block text-sm font-medium text-gray-700">
                Item
              </label>
              <select
                id="itemId"
                name="itemId"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {isLoading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 