"use client";

import { useState, useEffect } from "react";
import { Task, User } from "@/types/prisma";
import { useSession } from "next-auth/react";
import { TaskList } from "@/components/tasks/task-list";
import { TaskModal } from "@/components/tasks/task-modal";
import { useRouter } from "next/navigation";

interface TaskFormData {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string;
  assigneeId?: string;
}

export default function TasksPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    const response = await fetch("/api/users");
    const data = await response.json();
    setUsers(data);
  };

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      await fetchTasks();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleEditTask = async (data: TaskFormData) => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      await fetchTasks();
      setIsModalOpen(false);
      setSelectedTask(undefined);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleOpenModal = (task?: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTask(undefined);
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">All Tasks</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Task
        </button>
      </div>

      <TaskList
        tasks={tasks}
        onEdit={handleOpenModal}
        onDelete={handleDeleteTask}
        isLoading={isLoading}
      />

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        users={users}
        onSubmit={selectedTask ? handleEditTask : handleCreateTask}
      />
    </div>
  );
} 