'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProfileFormData {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
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
    const data: ProfileFormData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccessMessage("Profile updated successfully");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={session.user?.name || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={session.user?.email || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled
            />
            <p className="mt-1 text-sm text-gray-500">
              Email cannot be changed
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {successMessage && (
            <div className="text-green-500 text-sm text-center">{successMessage}</div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Account Security</h2>
          <div className="space-y-4">
            <button
              type="button"
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => router.push("/profile/change-password")}
            >
              Change Password
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
          <div className="space-y-4">
            <button
              type="button"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={() => {
                if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                  // Handle account deletion
                }
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 