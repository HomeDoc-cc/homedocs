import { useState } from 'react';

import { TaskFormData } from '@/components/tasks/task-modal';
import { TaskStatus } from '@/types/prisma';

export function useTaskActions(onTasksChange?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = async (data: TaskFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const payload = {
        ...data,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        assigneeId: data.assigneeId || null,
        interval: data.interval || null,
        unit: data.unit || null,
        homeId: data.homeId || null,
        roomId: data.roomId || null,
        itemId: data.itemId || null,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Create task response error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error('Failed to create task');
      }

      onTasksChange?.();
      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId: string, data: TaskFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const payload = {
        ...data,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        assigneeId: data.assigneeId || null,
        interval: data.interval || null,
        unit: data.unit || null,
        homeId: data.homeId || null,
        roomId: data.roomId || null,
        itemId: data.itemId || null,
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Update task response error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error('Failed to update task');
      }

      onTasksChange?.();
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return false;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Delete task response error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error('Failed to delete task');
      }

      onTasksChange?.();
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete task');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to mark this task as complete?')) return false;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: TaskStatus.COMPLETED,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Complete task response error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error('Failed to complete task');
      }

      onTasksChange?.();
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      setError(error instanceof Error ? error.message : 'Failed to complete task');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    isLoading,
    error,
  };
}
