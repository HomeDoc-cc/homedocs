'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserMenu } from "./user-menu";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                HomeDocs
              </Link>
            </div>
            {session?.user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/tasks"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
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
                className="text-gray-500 hover:text-gray-900"
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