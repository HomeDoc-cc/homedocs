'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { TaskList } from '@/components/tasks/task-list';
import { useTaskData } from '@/hooks/use-task-data';

interface TasksPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TasksPage({ params }: TasksPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    async function getParams() {
      const { id } = await params;
      setId(id);
    }
    getParams();
  }, [params]);

  const { tasks, users, isLoading, refetch } = useTaskData({
    type: 'room',
    id: id || undefined,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Room Tasks</h1>
      </div>

      <TaskList tasks={tasks} users={users} onTasksChange={refetch} isLoading={isLoading} />
    </div>
  );
}
