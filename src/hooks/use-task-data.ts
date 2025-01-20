import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Task, User } from '@/types/prisma';

interface UseTaskDataProps {
  type?: 'home' | 'room' | 'item';
  id?: string;
}

export function useTaskData({ type, id }: UseTaskDataProps = {}) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFetchedInitialData = useRef(false);
  const previousType = useRef(type);
  const previousId = useRef(id);

  const fetchTasks = useCallback(async () => {
    if (!session?.user?.email) {
      setError('Not authenticated');
      setTasks([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      let url = '/api/tasks';

      // Add query parameters for specific tasks
      if (type && id) {
        url += `?${type}Id=${id}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data);
      setError(null);
      hasFetchedInitialData.current = true;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [session, type, id]);

  const fetchUsers = useCallback(async () => {
    if (!session?.user?.email) {
      setUsers([]);
      return;
    }

    try {
      // If we're fetching tasks for a specific home, pass the homeId
      const homeId = type === 'home' ? id : undefined;
      const endpoint = homeId ? `/api/users?homeId=${homeId}` : '/api/users';
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  }, [session, type, id]);

  useEffect(() => {
    // Check if type or id has changed
    if (type !== previousType.current || id !== previousId.current) {
      hasFetchedInitialData.current = false;
      previousType.current = type;
      previousId.current = id;
    }

    // Fetch tasks if we have a session and either:
    // 1. No type/id specified (fetch all tasks)
    // 2. Both type and id are specified (fetch specific tasks)
    if (!type || (type && id)) {
      void fetchTasks();
    }
  }, [type, id, fetchTasks]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return {
    tasks,
    users,
    isLoading,
    error,
    refetch: useCallback(() => {
      hasFetchedInitialData.current = false;
      return fetchTasks();
    }, [fetchTasks]),
  };
}
