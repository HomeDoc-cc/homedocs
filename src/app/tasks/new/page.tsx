'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

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
  isRecurring: boolean;
  interval?: number;
  unit?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const homeId = searchParams.get('homeId');
  const roomId = searchParams.get('roomId');
  const itemId = searchParams.get('itemId');
  const [showRecurring, setShowRecurring] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(homeId ? `/api/users?homeId=${homeId}` : '/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  }, [homeId]);

  useEffect(() => {
    fetchUsers();
    if (!homeId && !roomId && !itemId) {
      fetchHomes();
    }
  }, [homeId, roomId, itemId, fetchUsers]);

  useEffect(() => {
    if (homeId) {
      fetchRoomsByHome(homeId);
    } else {
      setRooms([]);
    }
  }, [homeId]);

  useEffect(() => {
    if (roomId) {
      fetchItemsByRoom(roomId);
    } else {
      setItems([]);
    }
  }, [roomId]);

  async function fetchHomes() {
    try {
      const response = await fetch('/api/homes');
      if (!response.ok) throw new Error('Failed to fetch homes');
      const data = await response.json();
      setHomes(data);
    } catch (error) {
      console.error('Error fetching homes:', error);
      setHomes([]);
    }
  }

  async function fetchRoomsByHome(homeId: string) {
    if (!homeId) {
      setRooms([]);
      return;
    }
    try {
      const response = await fetch(`/api/homes/${homeId}/rooms`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
  }

  async function fetchItemsByRoom(roomId: string) {
    if (!roomId) {
      setItems([]);
      return;
    }
    try {
      const response = await fetch(`/api/rooms/${roomId}/items`);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data: TaskFormData = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: (formData.get('dueDate') as string) || undefined,
      assigneeId: (formData.get('assigneeId') as string) || undefined,
      homeId: homeId || (formData.get('homeId') as string),
      roomId: roomId || (formData.get('roomId') as string),
      itemId: itemId || (formData.get('itemId') as string),
      isRecurring: formData.get('isRecurring') === 'true',
      interval: formData.get('interval') ? parseInt(formData.get('interval') as string) : undefined,
      unit: formData.get('unit') as TaskFormData['unit'],
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const task = await response.json();
      router.push(`/tasks/${task.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Create New Task</h1>

      <form onSubmit={onSubmit} className="max-w-2xl mx-auto space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
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
            name="description"
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            id="dueDate"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="assigneeId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Assignee
          </label>
          <select
            name="assigneeId"
            id="assigneeId"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isRecurring"
              id="isRecurring"
              checked={showRecurring}
              onChange={(e) => setShowRecurring(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
            />
            <label
              htmlFor="isRecurring"
              className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Recurring Task
            </label>
          </div>

          {showRecurring && (
            <div className="pl-6 space-y-4">
              <div>
                <label
                  htmlFor="interval"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Repeat every
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="number"
                    name="interval"
                    id="interval"
                    min="1"
                    required={showRecurring}
                    className="block w-24 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    name="unit"
                    id="unit"
                    required={showRecurring}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  >
                    <option value="DAILY">Days</option>
                    <option value="WEEKLY">Weeks</option>
                    <option value="MONTHLY">Months</option>
                    <option value="YEARLY">Years</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {!homeId && !roomId && !itemId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="homeId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Home
              </label>
              <select
                id="homeId"
                name="homeId"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                onChange={(e) => {
                  const selectedHomeId = e.target.value;
                  if (selectedHomeId) {
                    fetchRoomsByHome(selectedHomeId);
                  } else {
                    setRooms([]);
                    setItems([]);
                  }
                }}
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
              <label
                htmlFor="roomId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Room
              </label>
              <select
                id="roomId"
                name="roomId"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                onChange={(e) => {
                  const selectedRoomId = e.target.value;
                  if (selectedRoomId) {
                    fetchItemsByRoom(selectedRoomId);
                  } else {
                    setItems([]);
                  }
                }}
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
            <label
              htmlFor="itemId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Item
            </label>
            <select
              id="itemId"
              name="itemId"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
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
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
