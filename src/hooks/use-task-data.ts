import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Task, User } from '@/types/prisma';

interface UseTaskDataProps {
  type?: 'home' | 'room' | 'item';
  id?: string;
}

export function useTaskData({ type, id }: UseTaskDataProps = {}) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const endpoint = type && id ? `/api/${type}s/${id}/tasks` : '/api/tasks';
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  useEffect(() => {
    if ((!type && !id) || (type && id)) {
      fetchTasks();
    }
  }, [type, id]);

  useEffect(() => {
    if (session) {
      fetchUsers();
    }
  }, [session]);

  return {
    tasks,
    users,
    isLoading,
    error,
    refetch: fetchTasks,
  };
}
