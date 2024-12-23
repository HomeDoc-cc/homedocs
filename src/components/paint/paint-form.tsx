"use client";

import { type Paint as PrismaPaint } from ".prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const paintSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  color: z.string().min(1, "Color is required"),
  finish: z.string().min(1, "Finish is required"),
  code: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  notes: z.string().optional(),
});

type PaintFormData = z.infer<typeof paintSchema>;

interface PaintFormProps {
  paint?: PrismaPaint;
  onSubmit: (data: PaintFormData) => void;
  onCancel: () => void;
}

export function PaintForm({ paint, onSubmit, onCancel }: PaintFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaintFormData>({
    resolver: zodResolver(paintSchema),
    defaultValues: paint ? {
      name: paint.name,
      brand: paint.brand,
      color: paint.color,
      finish: paint.finish,
      code: paint.code || undefined,
      location: paint.location || "",
      notes: paint.notes || undefined,
    } : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          {...register("name")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
          Brand
        </label>
        <input
          type="text"
          id="brand"
          {...register("brand")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.brand && (
          <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700">
          Color
        </label>
        <input
          type="text"
          id="color"
          {...register("color")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.color && (
          <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="finish" className="block text-sm font-medium text-gray-700">
          Finish
        </label>
        <select
          id="finish"
          {...register("finish")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select a finish</option>
          <option value="Matte">Matte</option>
          <option value="Eggshell">Eggshell</option>
          <option value="Satin">Satin</option>
          <option value="Semi-Gloss">Semi-Gloss</option>
          <option value="Gloss">Gloss</option>
        </select>
        {errors.finish && (
          <p className="mt-1 text-sm text-red-600">{errors.finish.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Paint Code
        </label>
        <input
          type="text"
          id="code"
          {...register("code")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.code && (
          <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <select
          id="location"
          {...register("location")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select a location</option>
          <option value="Walls">Walls</option>
          <option value="Trim">Trim</option>
          <option value="Ceiling">Ceiling</option>
          <option value="Doors">Doors</option>
          <option value="Cabinets">Cabinets</option>
          <option value="Other">Other</option>
        </select>
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register("notes")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isSubmitting ? "Saving..." : paint ? "Update Paint" : "Add Paint"}
        </button>
      </div>
    </form>
  );
} 