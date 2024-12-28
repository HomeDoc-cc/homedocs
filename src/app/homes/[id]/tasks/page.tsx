'use client';

import { useCallback, useEffect, useState } from 'react';

import { TaskList } from '@/components/tasks/task-list';
import { useTaskData } from '@/hooks/use-task-data';

interface TasksPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TasksPage({ params }: TasksPageProps) {
  const [id, setId] = useState<string | null>(null);

  const getParams = useCallback(async () => {
    const { id } = await params;
    setId(id);
  }, [params]);

  useEffect(() => {
    if (id) {
      getParams();
    }
  }, [id, getParams]);

  const { tasks, users, isLoading, refetch } = useTaskData({
    type: 'home',
    id: id || undefined,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Home Tasks</h1>
      </div>

      <TaskList tasks={tasks} users={users} onTasksChange={refetch} isLoading={isLoading} />
    </div>
  );
}
