'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useState } from 'react';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => redirect('/auth/signin'),
  });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const data: PasswordFormData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    if (data.newPassword !== data.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (data.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setSuccessMessage('Password changed successfully');

      // Clear the form
      event.currentTarget.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/profile')}
          className="text-blue-500 hover:text-blue-600"
        >
          ← Back to Profile
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8">Change Password</h1>

      <div className="max-w-md mx-auto">
        <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              required
              minLength={8}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">Must be at least 8 characters long</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={8}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          {successMessage && (
            <div className="text-green-500 text-sm text-center">{successMessage}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
