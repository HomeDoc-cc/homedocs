'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import React from 'react';

export default function NotFound() {
  const router = useRouter();

  React.useEffect(() => {
    try {
      logger.info('404 page accessed', {
        page: '404',
        event: 'page_view'
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorObject = error instanceof Error ? error : new Error(errorMessage);

      logger.error('Error logging 404 page access', {
        page: '404',
        error: errorObject,
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-extrabold text-blue-600 dark:text-blue-400">404</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => logger.info('404 page navigation', {
              page: '404',
              event: 'click_home',
              destination: '/'
            })}
          >
            Go back home
          </Link>
          <button
            onClick={() => {
              logger.info('404 page navigation', {
                page: '404',
                event: 'click_back'
              });
              router.back();
            }}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
