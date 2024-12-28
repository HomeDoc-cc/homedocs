'use client';

import Link from 'next/link';

import { TaskList } from '@/components/tasks/task-list';
import { useTaskData } from '@/hooks/use-task-data';

export function RecentTasks() {
  const { tasks, users, isLoading, refetch } = useTaskData();

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

      <TaskList tasks={tasks} users={users} onTasksChange={refetch} isLoading={isLoading} />

      {tasks.length === 0 && !isLoading && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">You don't have any active tasks.</p>
          <Link
            href="/tasks/new"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-2 inline-block"
          >
            Create your first task
          </Link>
        </div>
      )}
    </section>
  );
}
