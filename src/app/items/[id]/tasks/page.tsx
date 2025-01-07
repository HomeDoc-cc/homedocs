'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { TaskList } from '@/components/tasks/task-list';
import { useTaskData } from '@/hooks/use-task-data';
import { hasWriteAccess } from '@/lib/permissions';

interface TasksPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TasksPage({ params }: TasksPageProps) {
  const { data: session } = useSession();
  const [id, setId] = useState<string | null>(null);
  const [item, setItem] = useState<{
    id: string;
    room: {
      id: string;
      home: {
        id: string;
        owner: { id: string };
        shares: Array<{ role: 'READ' | 'WRITE'; user: { id: string } }>;
      };
    };
  } | null>(null);

  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);

  useEffect(() => {
    async function fetchItem() {
      if (!id) return;
      try {
        const response = await fetch(`/api/items/${id}`);
        if (!response.ok) throw new Error('Failed to fetch item');
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error('Error fetching item:', error);
      }
    }
    fetchItem();
  }, [id]);

  const { tasks, users, isLoading, refetch } = useTaskData({
    type: 'item',
    id: id || undefined,
  });

  const canEdit = item ? hasWriteAccess(session?.user?.id, item.room.home) : false;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Item Tasks</h1>
      </div>

      <TaskList
        tasks={tasks}
        users={users}
        onTasksChange={refetch}
        isLoading={isLoading}
        canEdit={canEdit}
      />
    </div>
  );
}
