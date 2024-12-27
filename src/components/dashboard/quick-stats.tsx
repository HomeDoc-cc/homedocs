'use client';

interface HomeWithCounts {
  _count: {
    rooms: number;
    tasks: number;
  };
}

interface QuickStatsProps {
  homes: HomeWithCounts[];
}

export function QuickStats({ homes }: QuickStatsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Total Homes</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{homes.length}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Total Rooms</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {homes.reduce((acc: number, home: HomeWithCounts) => acc + home._count.rooms, 0)}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Active Tasks</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {homes.reduce((acc: number, home: HomeWithCounts) => acc + home._count.tasks, 0)}
        </p>
      </div>
    </section>
  );
}
