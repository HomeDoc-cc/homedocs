'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { logger } from '@/lib/logger';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus('error');
        setError('No verification token provided');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify email');
        }

        setStatus('success');
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (error) {
        logger.error('Failed to verify email', {
          error: error instanceof Error ? error : undefined,
          token,
        });
        setStatus('error');
        setError(error instanceof Error ? error.message : 'Failed to verify email');
      }
    }

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Email Verification
          </h2>
          <div className="mt-4">
            {status === 'loading' && (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">Verifying your email...</p>
              </div>
            )}
            {status === 'success' && (
              <div className="text-center">
                <p className="text-green-600 dark:text-green-400">
                  Your email has been verified successfully!
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Redirecting you to the dashboard...
                </p>
              </div>
            )}
            {status === 'error' && (
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
