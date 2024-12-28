import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { type Flooring as PrismaFlooring } from '.prisma/client';

interface FlooringModalProps {
  isOpen: boolean;
  onClose: () => void;
  flooring?: PrismaFlooring;
  onSubmit: (data: FlooringFormData) => void;
}

interface FlooringFormData {
  name: string;
  type: string;
  material: string;
  brand: string;
  color?: string | null;
  pattern?: string | null;
  notes?: string | null;
}

export function FlooringModal({ isOpen, onClose, flooring, onSubmit }: FlooringModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FlooringFormData>({
    defaultValues: {
      name: '',
      type: '',
      material: '',
      brand: '',
      color: '',
      pattern: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (flooring) {
      reset({
        name: flooring.name,
        type: flooring.type,
        material: flooring.material,
        brand: flooring.brand,
        color: flooring.color || '',
        pattern: flooring.pattern || '',
        notes: flooring.notes || '',
      });
    } else {
      reset({
        name: '',
        type: '',
        material: '',
        brand: '',
        color: '',
        pattern: '',
        notes: '',
      });
    }
  }, [flooring, reset]);

  const handleFormSubmit = (data: FlooringFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {flooring ? 'Edit Flooring' : 'Add Flooring'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {flooring
                          ? 'Update the flooring details below'
                          : 'Enter the flooring details below'}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          {...register('name', { required: true })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">Name is required</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <input
                          type="text"
                          {...register('type', { required: true })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {errors.type && (
                          <p className="mt-1 text-sm text-red-600">Type is required</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="material"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Material
                        </label>
                        <input
                          type="text"
                          {...register('material', { required: true })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {errors.material && (
                          <p className="mt-1 text-sm text-red-600">Material is required</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                          Brand
                        </label>
                        <input
                          type="text"
                          {...register('brand', { required: true })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {errors.brand && (
                          <p className="mt-1 text-sm text-red-600">Brand is required</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                          Color
                        </label>
                        <input
                          type="text"
                          {...register('color')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="pattern"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Pattern
                        </label>
                        <input
                          type="text"
                          {...register('pattern')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>
                        <textarea
                          {...register('notes')}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {flooring ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
