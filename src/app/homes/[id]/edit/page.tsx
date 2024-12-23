'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface EditHomePageProps {
  params: {
    id: string;
  };
}

interface Home {
  id: string;
  name: string;
  address: string;
}

export default function EditHomePage({ params }: EditHomePageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [home, setHome] = useState<Home | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchHome();
  }, [params.id]);

  async function fetchHome() {
    try {
      const response = await fetch(`/api/homes/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch home");
      }
      const data = await response.json();
      setHome(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch home");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
    };

    try {
      const response = await fetch(`/api/homes/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update home");
      }

      router.push(`/homes/${params.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update home");
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete() {
    if (!window.confirm("Are you sure you want to delete this home? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/homes/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete home");
      }

      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete home");
      setIsDeleting(false);
    }
  }

  if (!home) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Home</h1>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Home Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={home.name}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Beach House"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              defaultValue={home.address}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 123 Ocean Drive"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Home"}
            </button>

            <div className="flex space-x-4">
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
          </div>
        </form>
      </div>
    </div>
  );
} 