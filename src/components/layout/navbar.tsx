'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UserMenu } from './user-menu';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    if (path === '/tasks') {
      return pathname.startsWith('/tasks');
    }
    return false;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="HomeDocs"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  HomeDocs
                </span>
              </Link>
            </div>
            {session?.user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className={classNames(
                    isActive('/dashboard')
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300',
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/tasks"
                  className={classNames(
                    isActive('/tasks')
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300',
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                  )}
                >
                  Tasks
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <Link
                href="/auth/signin"
                className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
