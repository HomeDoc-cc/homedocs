import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { logger, getServerContext } from '@/lib/logger';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    logger.info('Authenticated user visiting landing page, redirecting to dashboard', {
      ...getServerContext(session.user.id, 'landing.redirect'),
    });
    redirect('/dashboard');
  }

  logger.info('Visitor accessing landing page', {
    ...getServerContext(undefined, 'landing.view'),
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Document and track your</span>
              <span className="block text-blue-600 dark:text-blue-400">home maintenance</span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
              Keep track of your home&apos;s maintenance tasks, appliances, and important documents
              in one place. Never forget a maintenance task again.
            </p>
            <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/auth/signup"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 md:px-10 md:py-4 md:text-lg"
                >
                  Get started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:ml-3 sm:mt-0">
                <Link
                  href="/auth/signin"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-blue-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700 md:px-10 md:py-4 md:text-lg"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to manage your home
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl text-gray-500 dark:text-gray-400">
              Simple, intuitive tools to keep your home maintenance organized.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="rounded-lg bg-blue-50 dark:bg-gray-700 p-4">
                    <svg
                      className="h-8 w-8 text-blue-600 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Task Management
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Create and track maintenance tasks with due dates, recurrence, and assignments.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <div className="rounded-lg bg-blue-50 dark:bg-gray-700 p-4">
                    <svg
                      className="h-8 w-8 text-blue-600 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Home Inventory
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Keep track of appliances, warranties, manuals, and important documents.
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <div className="rounded-lg bg-blue-50 dark:bg-gray-700 p-4">
                    <svg
                      className="h-8 w-8 text-blue-600 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  Calendar Integration
                </h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Sync maintenance tasks with your calendar and get reminders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-24 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-600 dark:text-blue-400">
              Create your free account today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-5 py-3 text-base font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
