'use client';

import { Task } from '@/types/prisma';

import { TaskCard } from './task-card';

interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  isLoading?: boolean;
}

export function TaskList({ tasks, onEdit, onDelete, isLoading = false }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new task.
        </p>
      </div>
    );
  }

  // Group tasks by recurring status
  const recurringTasks = tasks.filter((task) => task.isRecurring);
  const nonRecurringTasks = tasks.filter((task) => !task.isRecurring);

  return (
    <div className="space-y-8">
      {recurringTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recurring Tasks
          </h3>
          <div className="space-y-4">
            {recurringTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit ? () => onEdit(task) : undefined}
                onDelete={onDelete ? () => onDelete(task) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {nonRecurringTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">One-time Tasks</h3>
          <div className="space-y-4">
            {nonRecurringTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit ? () => onEdit(task) : undefined}
                onDelete={onDelete ? () => onDelete(task) : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
