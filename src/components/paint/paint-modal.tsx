"use client";

import { Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { type Paint as PrismaPaint } from ".prisma/client";

interface PaintFormData {
  name: string;
  brand: string;
  color: string;
  finish: string;
  code?: string | null;
  location?: string | null;
  notes?: string | null;
}

interface PaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  paint?: PrismaPaint;
  onSubmit: (data: PaintFormData) => void;
}

export function PaintModal({ isOpen, onClose, paint, onSubmit }: PaintModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaintFormData>({
    defaultValues: {
      name: "",
      brand: "",
      color: "",
      finish: "",
      code: "",
      location: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (paint) {
      reset({
        name: paint.name,
        brand: paint.brand,
        color: paint.color,
        finish: paint.finish,
        code: paint.code || "",
        location: paint.location || "",
        notes: paint.notes || "",
      });
    } else {
      reset({
        name: "",
        brand: "",
        color: "",
        finish: "",
        code: "",
        location: "",
        notes: "",
      });
    }
  }, [paint, reset]);

  const handleFormSubmit = (data: PaintFormData) => {
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
                        {paint ? "Edit Paint" : "Add Paint"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {paint
                          ? "Update the paint details below"
                          : "Enter the paint details below"}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          {...register("name", { required: true })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            Name is required
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="brand"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Brand
                        </label>
                        <input
                          type="text"
                          {...register("brand", { required: true })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {errors.brand && (
                          <p className="mt-1 text-sm text-red-600">
                            Brand is required
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="color"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Color
                        </label>
                        <input
                          type="text"
                          {...register("color", { required: true })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {errors.color && (
                          <p className="mt-1 text-sm text-red-600">
                            Color is required
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="finish"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Finish
                        </label>
                        <input
                          type="text"
                          {...register("finish", { required: true })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {errors.finish && (
                          <p className="mt-1 text-sm text-red-600">
                            Finish is required
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="code"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Code
                        </label>
                        <input
                          type="text"
                          {...register("code")}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="location"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Location
                        </label>
                        <input
                          type="text"
                          {...register("location")}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="notes"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Notes
                        </label>
                        <textarea
                          {...register("notes")}
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
                      {paint ? "Update" : "Create"}
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