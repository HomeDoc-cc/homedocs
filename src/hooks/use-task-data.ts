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
    if (!session) return;

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
      hasFetchedInitialData.current = true;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [type, id, session]);

  const fetchUsers = useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  }, [session]);

  useEffect(() => {
    // Check if type or id has changed
    if (type !== previousType.current || id !== previousId.current) {
      hasFetchedInitialData.current = false;
      previousType.current = type;
      previousId.current = id;
    }

    // Only fetch if we have a session and either:
    // 1. No type/id specified (fetch all tasks)
    // 2. Both type and id are specified (fetch specific tasks)
    // And we haven't fetched the initial data yet
    if (session && (!type || (type && id)) && !hasFetchedInitialData.current) {
      fetchTasks();
    }
  }, [type, id, session, fetchTasks]);

  useEffect(() => {
    if (session) {
      fetchUsers();
    }
  }, [session, fetchUsers]);

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
