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
  const [home, setHome] = useState<{
    id: string;
    owner: { id: string };
    shares: Array<{ role: 'READ' | 'WRITE'; user: { id: string } }>;
  } | null>(null);

  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);

  useEffect(() => {
    async function fetchHome() {
      if (!id) return;
      try {
        const response = await fetch(`/api/homes/${id}`);
        if (!response.ok) throw new Error('Failed to fetch home');
        const data = await response.json();
        setHome(data);
      } catch (error) {
        console.error('Error fetching home:', error);
      }
    }
    fetchHome();
  }, [id]);

  const { tasks, users, isLoading, refetch } = useTaskData({
    type: 'home',
    id: id || undefined,
  });

  const canEdit = home ? hasWriteAccess(session?.user?.id, home) : false;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Home Tasks</h1>
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
