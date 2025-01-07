'use client';

import Link from 'next/link';
import { JSX, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useTimezone } from '@/contexts/timezone-context';
import { Task } from '@/types/prisma';

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const statusColors = {
  PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const unitDisplay = {
  DAILY: 'day',
  WEEKLY: 'week',
  MONTHLY: 'month',
  YEARLY: 'year',
};

function toUnitDisplay(count: number, unit: string) {
  const display = `${unitDisplay[unit as keyof typeof unitDisplay]}`;
  return count === 1 ? display : `${count} ${display}s`;
}

function LocationLink({ type, id, name }: { type: string; id: string; name: string }) {
  return (
    <Link href={`/${type}s/${id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
      {name}
    </Link>
  );
}

function getLocationLinks(task: Task) {
  const parts: JSX.Element[] = [];
  if (task.item) {
    parts.push(<LocationLink key="item" type="item" id={task.item.id} name={task.item.name} />);
  }
  if (task.room) {
    parts.push(<LocationLink key="room" type="room" id={task.room.id} name={task.room.name} />);
  }
  if (task.home) {
    parts.push(<LocationLink key="home" type="home" id={task.home.id} name={task.home.name} />);
  }
  return parts;
}

export function TaskCard({ task, onEdit, onDelete, onComplete }: TaskCardProps) {
  const { timezone } = useTimezone();
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const locationLinks = getLocationLinks(task);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [isLongDescription, setIsLongDescription] = useState(false);

  useEffect(() => {
    if (descriptionRef.current) {
      // Check if the description content height is greater than the line height
      setIsLongDescription(
        descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight
      );
    }
  }, [task.description]);

  const formatDate = (date: string) => {
    const utcDate = new Date(date);
    return utcDate.toLocaleDateString('en-US', {
      timeZone: timezone,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{task.title}</h3>
          {task.description && (
            <div className="mt-1">
              <div
                ref={descriptionRef}
                className={`text-sm text-gray-500 dark:text-gray-400 prose dark:prose-invert max-w-none prose-sm ${
                  !isDescriptionExpanded ? 'line-clamp-1' : ''
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description}</ReactMarkdown>
              </div>
              {isLongDescription && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-1 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {isDescriptionExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}
          {locationLinks.length > 0 && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {locationLinks.reduce((prev, curr, i) => (
                <>
                  {prev}
                  {i > 0 && <span className="mx-1">›</span>}
                  {curr}
                </>
              ))}
            </p>
          )}
        </div>
        {(onEdit || onDelete || onComplete) && (
          <div className="flex space-x-2">
            {onComplete && task.status !== 'COMPLETED' && (
              <button
                onClick={onComplete}
                className="text-gray-400 hover:text-green-500 dark:text-gray-500 dark:hover:text-green-400"
                title="Mark as complete"
              >
                <span className="sr-only">Complete</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <span className="sr-only">Edit</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <span className="sr-only">Delete</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`hidden inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>
        <span
          className={`hidden inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[task.status]
          }`}
        >
          {task.status.replace('_', ' ')}
        </span>
        {task.dueDate && (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isOverdue
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Due {formatDate(task.dueDate)}
          </span>
        )}
        {task.isRecurring && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            Repeats every {toUnitDisplay(task.interval || 1, task.unit || 'DAY')}
          </span>
        )}
      </div>
      {task.assignee && (
        <div className="mt-4 flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {task.assignee.name?.[0] || task.assignee.email?.[0] || '?'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {task.assignee.name || task.assignee.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Assigned to</p>
          </div>
        </div>
      )}
    </div>
  );
}
