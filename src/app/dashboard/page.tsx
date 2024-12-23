import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getUserHomes } from "@/lib/home.utils";
import { getRecentTasks } from "@/lib/task.utils";
import Link from "next/link";
import { TaskList } from "@/components/tasks/task-list";

interface HomeWithCounts {
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

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
    return null;
  }

  const [homes, recentTasks] = await Promise.all([
    getUserHomes(session.user.id),
    getRecentTasks(session.user.id),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Homes Overview */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Your Homes</h2>
          <Link
            href="/homes/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Home
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homes.map((home: HomeWithCounts) => (
            <Link
              key={home.id}
              href={`/homes/${home.id}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{home.name}</h3>
              <p className="text-gray-600 mb-4">{home.address}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{home._count.rooms} Rooms</span>
                <span>{home._count.tasks} Tasks</span>
              </div>
            </Link>
          ))}

          {homes.length === 0 && (
            <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">You haven't added any homes yet.</p>
              <Link
                href="/homes/new"
                className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
              >
                Add your first home
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recent Tasks */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Tasks</h2>
          <Link href="/tasks" className="text-blue-500 hover:text-blue-600">
            View All Tasks
          </Link>
        </div>

        <TaskList tasks={recentTasks} />

        {recentTasks.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">You don't have any active tasks.</p>
            <Link
              href="/tasks/new"
              className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
            >
              Create your first task
            </Link>
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Homes</h3>
          <p className="text-3xl font-bold">{homes.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Rooms</h3>
          <p className="text-3xl font-bold">
            {homes.reduce(
              (acc: number, home: HomeWithCounts) => acc + home._count.rooms,
              0
            )}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Tasks</h3>
          <p className="text-3xl font-bold">
            {homes.reduce(
              (acc: number, home: HomeWithCounts) => acc + home._count.tasks,
              0
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
