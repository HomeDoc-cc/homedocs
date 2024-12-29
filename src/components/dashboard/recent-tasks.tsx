'use client';

import Link from 'next/link';

import { TaskList } from '@/components/tasks/task-list';
import { useTaskData } from '@/hooks/use-task-data';

export function RecentTasks() {
  const { tasks, users, isLoading } = useTaskData();

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
        <Link
          href="/tasks"
          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View All Tasks
        </Link>
      </div>

      <TaskList tasks={tasks} users={users} isLoading={isLoading} />
    </section>
  );
}
