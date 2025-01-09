'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
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
  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => redirect('/auth/signin'),
  });
  const [id, setId] = useState<string | null>(null);
  const [room, setRoom] = useState<{
    id: string;
    home: {
      id: string;
      owner: { id: string };
      shares: Array<{ role: 'READ' | 'WRITE'; user: { id: string } }>;
    };
  } | null>(null);

  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);

  useEffect(() => {
    async function fetchRoom() {
      if (!id) return;
      try {
        const response = await fetch(`/api/rooms/${id}`);
        if (!response.ok) throw new Error('Failed to fetch room');
        const data = await response.json();
        setRoom(data);
      } catch (error) {
        console.error('Error fetching room:', error);
      }
    }
    fetchRoom();
  }, [id]);

  const { tasks, users, isLoading, refetch } = useTaskData({
    type: 'room',
    id: id || undefined,
  });

  const canEdit = room ? hasWriteAccess(session?.user?.id, room.home) : false;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Room Tasks</h1>
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
