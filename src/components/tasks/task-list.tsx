'use client';

import { useEffect, useState } from 'react';

import { useTaskActions } from '@/hooks/use-task-actions';
import { Task, User } from '@/types/prisma';

import { TaskCard } from './task-card';
import { TaskFormData, TaskModal } from './task-modal';

interface TaskListProps {
  tasks: Task[];
  users: User[];
  onTasksChange: () => void;
  isLoading: boolean;
  canEdit?: (task: Task) => boolean;
  canCreateTask?: boolean;
  defaultHomeId?: string;
  defaultRoomId?: string;
  defaultItemId?: string;
}

export function TaskList({
  tasks,
  users,
  onTasksChange,
  isLoading,
  canEdit,
  canCreateTask = false,
  defaultHomeId,
  defaultRoomId,
  defaultItemId,
}: TaskListProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<'7' | '30' | '120' | 'all'>(() => {
    // Try to get the stored preference from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('taskDateFilter');
      return (stored as '7' | '30' | '120' | 'all') || 'all';
    }
    return 'all';
  });

  const { createTask, updateTask, deleteTask, completeTask, error } = useTaskActions(onTasksChange);

  // Update localStorage when dateFilter changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskDateFilter', dateFilter);
    }
  }, [dateFilter]);

  const handleOpenModal = (task?: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: TaskFormData) => {
    const success = selectedTask ? await updateTask(selectedTask.id, data) : await createTask(data);

    if (success) {
      handleCloseModal();
    }
  };

  const handleTransitionEnd = () => {
    setSelectedTask(undefined);
  };

  const canEditTask = (task: Task) => {
    return canEdit ? canEdit(task) : false;
  };

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
          {canCreateTask
            ? 'Get started by creating a new task.'
            : 'No tasks have been created yet.'}
        </p>
        {canCreateTask && (
          <div className="mt-6">
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Task
            </button>
          </div>
        )}

        <TaskModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          task={selectedTask}
          users={users}
          onSubmit={handleSubmit}
          defaultHomeId={defaultHomeId}
          defaultRoomId={defaultRoomId}
          defaultItemId={defaultItemId}
        />
      </div>
    );
  }

  const now = new Date();
  const filterDays = dateFilter === 'all' ? Infinity : parseInt(dateFilter);
  const filterDate = new Date(now.getTime() + filterDays * 24 * 60 * 60 * 1000);

  const filteredTasks = tasks.filter((task) => {
    if (!task.dueDate) return true;
    const dueDate = new Date(task.dueDate);
    return dueDate <= filterDate;
  });

  const activeTasks = filteredTasks.filter((task) => task.status !== 'COMPLETED');
  const completedTasks = filteredTasks.filter((task) => task.status === 'COMPLETED');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Tasks</h2>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
            className="rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All tasks</option>
            <option value="7">Next 7 days</option>
            <option value="30">Next 30 days</option>
            <option value="120">Next 120 days</option>
          </select>
        </div>
        {canCreateTask && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Task
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTasks.length > 0 && (
        <div>
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={canEditTask(task) ? () => handleOpenModal(task) : undefined}
                onDelete={canEditTask(task) ? () => deleteTask(task.id) : undefined}
                onComplete={canEditTask(task) ? () => completeTask(task.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg
              className={`h-5 w-5 transform transition-transform ${showCompleted ? 'rotate-90' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Completed Tasks ({completedTasks.length})</span>
          </button>

          {showCompleted && (
            <div className="mt-4 space-y-4">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={canEditTask(task) ? () => handleOpenModal(task) : undefined}
                  onDelete={canEditTask(task) ? () => deleteTask(task.id) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onTransitionEnd={handleTransitionEnd}
        task={selectedTask}
        users={users}
        onSubmit={handleSubmit}
        defaultHomeId={defaultHomeId}
        defaultRoomId={defaultRoomId}
        defaultItemId={defaultItemId}
      />
    </div>
  );
}
