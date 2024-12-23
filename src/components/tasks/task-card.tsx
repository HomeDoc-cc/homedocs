'use client';

import { Task } from "@/types/prisma";
import { formatDistanceToNow } from "date-fns";

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
}

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
} as const;

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
} as const;

function formatDueDate(dueDate: string | Date | null | undefined) {
  if (!dueDate) return null;
  try {
    return formatDistanceToNow(new Date(dueDate));
  } catch (error) {
    console.error("Error formatting due date:", error);
    return null;
  }
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const formattedDueDate = formatDueDate(task.dueDate);

  return (
    <div className="bg-white shadow rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-500"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-gray-500 text-sm">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            priorityColors[task.priority as keyof typeof priorityColors]
          }`}
        >
          {task.priority}
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[task.status as keyof typeof statusColors]
          }`}
        >
          {task.status}
        </span>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        {formattedDueDate && (
          <div className="flex items-center space-x-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Due {formattedDueDate} from now</span>
          </div>
        )}
      </div>
    </div>
  );
}
