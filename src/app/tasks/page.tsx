'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

import { TaskList } from '@/components/tasks/task-list';
import { useTaskData } from '@/hooks/use-task-data';
import { Task } from '@/types/prisma';

export default function TasksPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => redirect('/auth/signin'),
  });
  const { tasks, users, isLoading, refetch } = useTaskData();

  const canEdit = (task: Task) => {
    if (!session?.user?.id) return false;
    return task.creatorId === session.user.id || task.assigneeId === session.user.id;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tasks</h1>
      </div>

      <TaskList
        tasks={tasks}
        users={users}
        onTasksChange={refetch}
        isLoading={isLoading}
        canEdit={canEdit}
        canCreateTask={true}
      />
    </div>
  );
}
