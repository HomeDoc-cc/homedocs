'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface EditItemPageProps {
  params: {
    id: string;
  };
}

interface Item {
  id: string;
  name: string;
  description?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  roomId: string;
}

export default function EditItemPage({ params }: EditItemPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [params.id]);

  async function fetchItem() {
    try {
      const response = await fetch(`/api/items/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch item");
      }
      const data = await response.json();
      setItem(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch item");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const purchasePrice = formData.get("purchasePrice") as string;
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string || null,
      purchaseDate: formData.get("purchaseDate") as string || null,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
    };

    try {
      const response = await fetch(`/api/items/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      router.push(`/items/${params.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update item");
    } finally {
      setIsLoading(false);
    }
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Item</h1>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Item Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={item.name}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Coffee Table"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={item.description || ""}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add any additional details about the item"
            />
          </div>

          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
              Purchase Date
            </label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              defaultValue={item.purchaseDate ? item.purchaseDate.split('T')[0] : ""}
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
                step="0.01"
                id="purchasePrice"
                name="purchasePrice"
                defaultValue={item.purchasePrice || ""}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

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
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 