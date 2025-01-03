'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface HomeWithCounts {
  id: string;
  name: string;
  address: string;
  _count: {
    rooms: number;
    tasks: number;
    items: number;
  };
}

interface HomesOverviewProps {
  homes: HomeWithCounts[];
}

export function HomesOverview({ homes }: HomesOverviewProps) {
  const { data: session } = useSession();
  const canAddHome = session?.user?.tier !== 'FREE' || homes.length === 0;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{canAddHome ? 'Your Homes' : 'Your Home'}</h2>
        {canAddHome && (
          <Link
            href="/homes/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Home
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homes.map((home: HomeWithCounts) => (
          <Link
            key={home.id}
            href={`/homes/${home.id}`}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {home.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{home.address}</p>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{home._count.rooms} Rooms</span>
              <span>{home._count.items} Items</span>
              <span>{home._count.tasks} Tasks</span>
            </div>
          </Link>
        ))}

        {homes.length === 0 && (
          <div className="col-span-full text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300">
              You haven&apos;t added any homes yet.
            </p>
            <Link
              href="/homes/new"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mt-2 inline-block"
            >
              Add your first home
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
