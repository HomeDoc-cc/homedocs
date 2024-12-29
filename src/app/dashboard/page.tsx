import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { HomesOverview } from '@/components/dashboard/homes-overview';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { RecentTasks } from '@/components/dashboard/recent-tasks';
import { authOptions } from '@/lib/auth';
import { getUserHomes } from '@/lib/home.utils';
import { getServerContext, logger } from '@/lib/logger';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    logger.info('Unauthorized access attempt to dashboard', {
      ...getServerContext(),
      path: '/dashboard',
    });
    redirect('/auth/signin');
    return null;
  }

  try {
    logger.info('Loading dashboard', getServerContext(session.user.id, 'dashboard.load'));

    const [homes] = await Promise.all([getUserHomes(session.user.id)]);

    logger.info('Dashboard loaded successfully', {
      ...getServerContext(session.user.id, 'dashboard.loaded'),
      homeCount: homes.length,
    });

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Dashboard</h1>
        <HomesOverview homes={homes} />
        <RecentTasks />
        <QuickStats homes={homes} />
      </div>
    );
  } catch (error) {
    logger.error('Failed to load dashboard', {
      ...getServerContext(session.user.id, 'dashboard.error'),
      error: error as Error,
    });
    throw error;
  }
}
