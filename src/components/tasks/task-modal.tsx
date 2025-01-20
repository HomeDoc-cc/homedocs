'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

import { Task, User } from '@/types/prisma';

import { TaskForm } from './task-form';

export type TaskFormData = {
  status: Task['status'];
  title: Task['title'];
  priority: Task['priority'];
  isRecurring: Task['isRecurring'];
  description?: string | null;
  dueDate?: string | null;
  interval?: number | null;
  unit?: Task['unit'] | null;
  homeId?: string | null;
  roomId?: string | null;
  itemId?: string | null;
  assigneeId?: string | null;
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransitionEnd?: () => void;
  task?: Task;
  users: User[];
  onSubmit: (data: TaskFormData) => void;
  defaultHomeId?: string;
  defaultRoomId?: string;
  defaultItemId?: string;
}

export function TaskModal({
  isOpen,
  onClose,
  onTransitionEnd,
  task,
  users,
  onSubmit,
  defaultHomeId,
  defaultRoomId,
  defaultItemId,
}: TaskModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment} afterLeave={onTransitionEnd}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div>
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {task ? 'Edit Task' : 'Create Task'}
                </Dialog.Title>
                <div className="mt-2">
                  <TaskForm
                    task={
                      task as Task & {
                        room?: { id: string; name: string; homeId: string } | undefined;
                        item?:
                          | {
                              id: string;
                              name: string;
                              roomId: string;
                              room: { id: string; name: string; homeId: string };
                            }
                          | undefined;
                      }
                    }
                    users={users}
                    onSubmit={onSubmit}
                    onCancel={() => onClose()}
                    defaultHomeId={defaultHomeId}
                    defaultRoomId={defaultRoomId}
                    defaultItemId={defaultItemId}
                  />
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
