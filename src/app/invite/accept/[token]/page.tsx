'use client';

import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface InviteDetails {
  email: string;
  homeName: string;
  role: string;
}

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { data: session } = useSession({ required: false });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    async function getParams() {
      const { token } = await params;
      setToken(token);
    }
    getParams();
  }, [params]);

  useEffect(() => {
    async function getInviteDetails() {
      if (!token) return;
      
      try {
        const response = await fetch(`/api/invite/${token}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to get invitation details');
        }
        const details = await response.json();
        setInviteDetails(details);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to get invitation details');
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      getInviteDetails();
    }
  }, [token]);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAccepting(true);
    
    try {
      const response = await fetch(`/api/invite/accept/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to accept invitation');
      }

      const share = await response.json();

      // Sign in the user with their new credentials
      const result = await signIn('credentials', {
        email: inviteDetails?.email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push(`/homes/${share.homeId}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to accept invitation');
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Loading invitation...
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please wait while we get things ready.
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
            Failed to load invitation
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (isAccepting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Accepting invitation...
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please wait while we add you to the home.
          </p>
        </div>
      </div>
    );
  }

  if (!inviteDetails) {
    return null;
  }

  // If user is logged in with a different email, show warning
  if (session?.user && session.user.email !== inviteDetails.email) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400">
              Wrong Account
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              This invitation was sent to {inviteDetails.email} but you&apos;re signed in as {session.user.email}.
            </p>
            <div className="mt-4">
              <Link
                href="/api/auth/signout"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Sign out and use a different account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in with the correct email, show accept button
  if (session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              You&apos;ve been invited!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              You&apos;ve been invited to join {inviteDetails.homeName} as a {inviteDetails.role.toLowerCase()} member
            </p>
          </div>

          <div>
            <button
              onClick={handleAcceptInvite}
              disabled={isAccepting}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept Invitation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            You&apos;ve been invited!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            You&apos;ve been invited to join {inviteDetails.homeName} as a {inviteDetails.role.toLowerCase()} member
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAcceptInvite}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={inviteDetails.email}
                disabled
                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 dark:text-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
              />
            </div>
            <div>
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="relative block w-full border-0 py-1.5 text-gray-900 dark:text-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Full name"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 dark:text-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isAccepting}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept Invitation
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              href={`/auth/signin?returnUrl=${encodeURIComponent(`/invite/accept/${token}`)}`}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
