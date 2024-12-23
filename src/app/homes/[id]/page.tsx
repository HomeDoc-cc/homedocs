'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface HomePageProps {
  params: {
    id: string;
  };
}

interface Home {
  id: string;
  name: string;
  address: string;
  _count: {
    rooms: number;
    tasks: number;
  };
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export default function HomePage({ params }: HomePageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [home, setHome] = useState<Home | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error || !home) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error || "Home not found"}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{home.name}</h1>
        <div className="space-x-4">
          <Link
            href={`/homes/${home.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Edit Home
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Details</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{home.address}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Owner</dt>
              <dd className="mt-1 text-sm text-gray-900">{home.owner.name || home.owner.email}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Rooms</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{home._count.rooms}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Active Tasks</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{home._count.tasks}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href={`/homes/${home.id}/rooms`}
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Rooms</h3>
          <p className="text-gray-600">Manage rooms and their contents</p>
        </Link>

        <Link
          href={`/homes/${home.id}/tasks`}
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Tasks</h3>
          <p className="text-gray-600">View and manage home tasks</p>
        </Link>

        <Link
          href={`/homes/${home.id}/paint`}
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">Paint</h3>
          <p className="text-gray-600">Track paint colors and finishes</p>
        </Link>
      </div>
    </div>
  );
} 