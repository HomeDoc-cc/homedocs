'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { TaskList } from '@/components/tasks/task-list';
import { useTaskData } from '@/hooks/use-task-data';

export default function TasksPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { tasks, users, isLoading, refetch } = useTaskData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h1>
      </div>

      <TaskList tasks={tasks} users={users} onTasksChange={refetch} isLoading={isLoading} />
    </div>
  );
}
