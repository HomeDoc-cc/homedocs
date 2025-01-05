'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    async function getParams() {
      const { token } = await params;
      setToken(token);
    }
    getParams();
  }, [params]);
  useEffect(() => {
    async function acceptInvite() {
      try {
        const response = await fetch(`/api/invite/accept/${token}`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to accept invitation');
        }

        const share = await response.json();
        router.push(`/homes/${share.homeId}`);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to accept invitation');
      } finally {
        setIsLoading(false);
      }
    }

    if (status === 'authenticated') {
      acceptInvite();
    } else if (status === 'unauthenticated') {
      // Redirect to sign in page with return URL
      const returnUrl = `/invite/accept/${token}`;
      router.push(`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [token, router, status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Processing invitation...
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please wait while we set things up.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400">
            Failed to accept invitation
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return null;
}
