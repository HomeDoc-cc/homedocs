'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface ItemFormData {
  name: string;
  description?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  roomId: string;
}

export default function NewItemPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data: ItemFormData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
      purchaseDate: formData.get("purchaseDate") as string || undefined,
      purchasePrice: formData.get("purchasePrice") ? 
        parseFloat(formData.get("purchasePrice") as string) : undefined,
      manufacturer: formData.get("manufacturer") as string || undefined,
      modelNumber: formData.get("modelNumber") as string || undefined,
      serialNumber: formData.get("serialNumber") as string || undefined,
      roomId: roomId || formData.get("roomId") as string,
    };

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create item");
      }

      const item = await response.json();
      router.push(`/items/${item.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create item");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Item</h1>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Item Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Living Room Sofa"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add any additional details about the item"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
                Purchase Date
              </label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
                Purchase Price
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="purchasePrice"
                  name="purchasePrice"
                  step="0.01"
                  min="0"
                  className="block w-full pl-7 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">
                Manufacturer
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="modelNumber" className="block text-sm font-medium text-gray-700">
                Model Number
              </label>
              <input
                type="text"
                id="modelNumber"
                name="modelNumber"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">
              Serial Number
            </label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {!roomId && (
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                Room *
              </label>
              <select
                id="roomId"
                name="roomId"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a room</option>
                {/* Room options will be populated dynamically */}
              </select>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 