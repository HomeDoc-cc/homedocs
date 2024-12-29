'use client';

import { useState } from 'react';

import { useTaskActions } from '@/hooks/use-task-actions';
import { Task, User } from '@/types/prisma';

import { TaskCard } from './task-card';
import { TaskModal, TaskFormData } from './task-modal';

interface TaskListProps {
  tasks: Task[];
  users: User[];
  onTasksChange?: () => void;
  isLoading?: boolean;
}

export function TaskList({ tasks, users, onTasksChange, isLoading = false }: TaskListProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const { createTask, updateTask, deleteTask, completeTask, error } = useTaskActions(onTasksChange);

  const handleOpenModal = (task?: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTask(undefined);
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: TaskFormData) => {
    const success = selectedTask ? await updateTask(selectedTask.id, data) : await createTask(data);

    if (success) {
      handleCloseModal();
    }
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
          Get started by creating a new task.
        </p>
        <div className="mt-6">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Task
          </button>
        </div>
      </div>
    );
  }

  // Group tasks by status and recurring status
  const activeTasks = tasks.filter((task) => task.status !== 'COMPLETED');
  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED');

  // Further group active tasks by recurring status
  const activeRecurringTasks = activeTasks.filter((task) => task.isRecurring);
  const activeNonRecurringTasks = activeTasks.filter((task) => !task.isRecurring);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Tasks</h2>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Task
        </button>
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

      {activeRecurringTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recurring Tasks
          </h3>
          <div className="space-y-4">
            {activeRecurringTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleOpenModal(task)}
                onDelete={() => deleteTask(task.id)}
                onComplete={() => completeTask(task.id)}
              />
            ))}
          </div>
        </div>
      )}

      {activeNonRecurringTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">One-time Tasks</h3>
          <div className="space-y-4">
            {activeNonRecurringTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => handleOpenModal(task)}
                onDelete={() => deleteTask(task.id)}
                onComplete={() => completeTask(task.id)}
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
                  onEdit={() => handleOpenModal(task)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        users={users}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
