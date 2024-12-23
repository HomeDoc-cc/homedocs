'use client';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Loading...
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we load your content
        </p>
      </div>
    </div>
  );
} 