'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import { HomesOverview } from '@/components/dashboard/homes-overview';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { TaskList } from '@/components/tasks/task-list';
import { useTaskData } from '@/hooks/use-task-data';
import { Task } from '@/types/prisma';

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated: () => redirect('/auth/signin'),
  });
  const [homes, setHomes] = useState([]);
  const { tasks, users, isLoading, refetch } = useTaskData();

  useEffect(() => {
    async function fetchHomes() {
      try {
        const response = await fetch('/api/homes');
        if (!response.ok) throw new Error('Failed to fetch homes');
        const data = await response.json();
        setHomes(data);
      } catch (error) {
        console.error('Error fetching homes:', error);
      }
    }

    if (session?.user?.id) {
      fetchHomes();
    }
  }, [session?.user?.id]);

  const canEdit = (task: Task) => {
    if (!session?.user?.id) return false;
    return task.creatorId === session.user.id || task.assigneeId === session.user.id;
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Dashboard</h1>
      <HomesOverview
        homes={homes}
        canAddHome={session.user.tier !== 'FREE' || homes.length === 0}
      />

      <div className="mb-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <TaskList
          tasks={tasks}
          users={users}
          isLoading={isLoading}
          onTasksChange={refetch}
          canEdit={canEdit}
          canCreateTask={true}
        />
      </div>

      <QuickStats homes={homes} />
    </div>
  );
}
