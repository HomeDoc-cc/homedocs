'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useToast } from '@/components/ui/use-toast';
import { User } from '@/types/prisma';

interface AdminStats {
  totalUsers: number;
  totalHomes: number;
  totalTasks: number;
  totalItems: number;
}

interface PaginatedUsers {
  users: User[];
  total: number;
}

type RoleFilter = 'ALL' | 'USER' | 'ADMIN';
type StatusFilter = 'ALL' | 'ACTIVE' | 'DISABLED';

export default function AdminDashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'database'>('overview');

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupFiles, setBackupFiles] = useState<string[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string>('');
  const pageSize = 10;

  const hasFetchedStats = useRef(false);
  const previousSearchQuery = useRef(searchQuery);
  const previousPage = useRef(page);
  const previousRoleFilter = useRef(roleFilter);
  const previousStatusFilter = useRef(statusFilter);
  const fetchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) return;

    async function checkAdminAccess() {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.status === 403) {
          redirect('/dashboard');
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to verify admin access',
          variant: 'destructive',
        });
      }
    }

    checkAdminAccess();
  }, [session, status, toast]);

  useEffect(() => {
    async function fetchAdminData() {
      if (hasFetchedStats.current) return;

      try {
        const statsRes = await fetch('/api/admin/stats');
        if (!statsRes.ok) {
          if (statsRes.status === 403) {
            redirect('/dashboard');
            return;
          }
          throw new Error('Failed to fetch admin data');
        }
        const statsData = await statsRes.json();
        setStats(statsData);
        hasFetchedStats.current = true;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      }
    }

    if (status !== 'loading' && session?.user) {
      fetchAdminData();
    }

    return () => {
      hasFetchedStats.current = false;
    };
  }, [session, status]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          search: searchQuery,
          role: roleFilter,
          status: statusFilter,
        });

        const usersRes = await fetch(`/api/admin/users?${searchParams}`);
        if (!usersRes.ok) {
          throw new Error('Failed to fetch users');
        }

        const data: PaginatedUsers = await usersRes.json();
        setUsers(data.users);
        setTotalUsers(data.total);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    }

    // Don't fetch if session is not loaded
    if (status === 'loading' || !session?.user) return;

    // Clear previous timeout
    if (fetchTimeout.current) {
      clearTimeout(fetchTimeout.current);
    }

    // Check if any filter has changed
    const hasFiltersChanged =
      searchQuery !== previousSearchQuery.current ||
      page !== previousPage.current ||
      roleFilter !== previousRoleFilter.current ||
      statusFilter !== previousStatusFilter.current;

    if (hasFiltersChanged) {
      // Update previous values
      previousSearchQuery.current = searchQuery;
      previousPage.current = page;
      previousRoleFilter.current = roleFilter;
      previousStatusFilter.current = statusFilter;

      // Set new timeout
      fetchTimeout.current = setTimeout(fetchUsers, 300);
    } else {
      // If no filters changed but we don't have users yet, fetch them
      if (users.length === 0) {
        fetchTimeout.current = setTimeout(fetchUsers, 300);
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }
    };
  }, [page, searchQuery, roleFilter, statusFilter, pageSize, session, status, users.length]);

  useEffect(() => {
    async function fetchBackups() {
      try {
        const response = await fetch('/api/admin/backup/restore');
        if (!response.ok) {
          throw new Error('Failed to fetch backup files');
        }
        const data = await response.json();
        setBackupFiles(data.files);
        if (data.files.length > 0) {
          setSelectedBackup(data.files[0]); // Select the most recent backup by default
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to fetch backup files',
          variant: 'destructive',
        });
      }
    }

    if (status !== 'loading' && session?.user) {
      fetchBackups();
    }
  }, [session, status, toast]);

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      await response.json();
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
      setEditingUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update user role');
    }
  };

  const handleToggleDisabled = async (userId: string, isDisabled: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, isDisabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      await response.json();
      setUsers(users.map((user) => (user.id === userId ? { ...user, isDisabled } : user)));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update user status');
    }
  };

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);

      const response = await fetch('/api/admin/backup', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to backup database');
      }

      toast({
        title: 'Success',
        description: data.message,
        variant: 'success',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to backup database';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) {
      toast({
        title: 'Error',
        description: 'Please select a backup file',
        variant: 'destructive',
      });
      return;
    }

    if (
      !window.confirm(
        'Are you sure you want to restore this backup? This will overwrite the current database.'
      )
    ) {
      return;
    }

    try {
      setIsRestoring(true);

      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: selectedBackup }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to restore database');
      }

      toast({
        title: 'Success',
        description: data.message,
        variant: 'success',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to restore database';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleVerifyEmail = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action: 'verify' }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify email');
      }

      const updatedUser = await response.json();
      setUsers(users.map((user) => (user.id === userId ? updatedUser : user)));
      toast({
        title: 'Success',
        description: 'Email marked as verified',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to verify email',
        variant: 'destructive',
      });
    }
  };

  const handleSendVerification = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action: 'send-verification' }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      const updatedUser = await response.json();
      setUsers(users.map((user) => (user.id === userId ? updatedUser : user)));
      toast({
        title: 'Success',
        description: 'Verification email sent',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send verification email',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  if (loading && !users.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error && !users.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`${
              activeTab === 'database'
                ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
          >
            Database
          </button>
        </nav>
      </div>

      <div className="space-y-8">
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Total Users
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalUsers}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Total Homes
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalHomes}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Total Tasks
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalTasks}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                Total Items
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalItems}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Users</h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value as RoleFilter);
                      setPage(1);
                    }}
                    className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as StatusFilter);
                      setPage(1);
                    }}
                    className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={user.isDisabled ? 'bg-gray-50 dark:bg-gray-900' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.name || 'No name'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {editingUser === user.id ? (
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN')
                            }
                            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        ) : (
                          user.role
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isDisabled
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}
                        >
                          {user.isDisabled ? 'Disabled' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.emailVerified
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : user.hasVerificationPending
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}
                          >
                            {user.emailVerified
                              ? 'Verified'
                              : user.hasVerificationPending
                                ? 'Pending'
                                : 'Not Verified'}
                          </span>
                          {editingUser === user.id && !user.emailVerified && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleVerifyEmail(user.id)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                title="Mark as verified"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleSendVerification(user.id)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                title={
                                  user.hasVerificationPending
                                    ? 'Resend verification email'
                                    : 'Send verification email'
                                }
                              >
                                {user.hasVerificationPending ? 'Resend' : 'Send'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <button
                          onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          {editingUser === user.id ? 'Cancel' : 'Manage'}
                        </button>
                        <button
                          onClick={() => handleToggleDisabled(user.id, !user.isDisabled)}
                          className={`${
                            user.isDisabled
                              ? 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300'
                              : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300'
                          }`}
                        >
                          {user.isDisabled ? 'Enable' : 'Disable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalUsers)}{' '}
                    of {totalUsers} users
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'database' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Database Management
              </h2>
              <div className="flex gap-4 items-end">
                <button
                  onClick={handleBackup}
                  disabled={isBackingUp}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBackingUp && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
                </button>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Backup
                  </label>
                  <select
                    value={selectedBackup}
                    onChange={(e) => setSelectedBackup(e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {backupFiles.map((file) => (
                      <option key={file} value={file}>
                        {file}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRestore}
                  disabled={isRestoring || !selectedBackup}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRestoring && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {isRestoring ? 'Restoring...' : 'Restore Backup'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
