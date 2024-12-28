'use client';

import { Menu, Transition } from '@headlessui/react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Fragment } from 'react';

import { ThemeSelector } from '../theme-selector';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <Menu as="div" className="relative ml-3">
      <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <span className="sr-only">Open user menu</span>
        {user.image ? (
          <img className="h-8 w-8 rounded-full" src={user.image} alt={user.name || 'User avatar'} />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 font-medium">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </span>
          </div>
        )}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/profile"
                  className={`block px-4 py-2 text-sm ${
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Your Profile
                </Link>
              )}
            </Menu.Item>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <ThemeSelector />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut()}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    active
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
