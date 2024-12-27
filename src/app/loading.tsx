'use client';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 dark:border-blue-400 mx-auto"></div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Loading...</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Please wait while we load your content
        </p>
      </div>
    </div>
  );
}
