import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface HomeSharesProps {
  shares: Array<{
    role: 'READ' | 'WRITE';
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
  pendingShares: Array<{
    email: string;
    role: 'READ' | 'WRITE';
    createdAt: Date;
    expiresAt: Date;
  }>;
  isOwner: boolean;
  homeId: string;
  onUpdate?: () => void;
}

export function HomeShares({ shares, pendingShares, isOwner, homeId, onUpdate }: HomeSharesProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localPendingShares, setLocalPendingShares] = useState(pendingShares);
  const [localShares, setLocalShares] = useState(shares);

  if (!isOwner) {
    return null;
  }

  const handleUnshare = async (userId: string) => {
    setIsLoading(userId);
    setError(null);
    try {
      const response = await fetch(`/api/homes/${homeId}/share/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to remove share');
      }
      setLocalShares(localShares.filter((share) => share.user.id !== userId));
      onUpdate?.();
    } catch {
      setError('Failed to remove share');
    } finally {
      setIsLoading(null);
    }
  };

  const handleRemoveInvite = async (email: string) => {
    setIsLoading(email);
    setError(null);
    try {
      const response = await fetch(
        `/api/homes/${homeId}/share/pending/${encodeURIComponent(email)}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to remove invite');
      }
      setLocalPendingShares(localPendingShares.filter((share) => share.email !== email));
      onUpdate?.();
    } catch {
      setError('Failed to remove invite');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="text-sm text-red-500 dark:text-red-400 mb-4">{error}</div>}

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shared With</h3>
        {localShares.length > 0 ? (
          <ul className="mt-3 divide-y divide-gray-200 dark:divide-gray-700">
            {localShares.map((share) => (
              <li key={share.user.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {share.user.name || share.user.email || 'Unknown user'}
                    </p>
                    {share.user.name && share.user.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{share.user.email}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${
                          share.role === 'WRITE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }
                      `}
                    >
                      {share.role === 'WRITE' ? 'Can edit' : 'Read only'}
                    </span>
                    <button
                      onClick={() => handleUnshare(share.user.id)}
                      disabled={isLoading === share.user.id}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      {isLoading === share.user.id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            This home hasn&apos;t been shared with anyone yet.
          </p>
        )}
      </div>

      {localPendingShares.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pending Invitations</h3>
          <ul className="mt-3 divide-y divide-gray-200 dark:divide-gray-700">
            {localPendingShares.map((share) => (
              <li key={share.email} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {share.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Invited {formatDistanceToNow(new Date(share.createdAt))} ago
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Expires in {formatDistanceToNow(new Date(share.expiresAt))}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${
                          share.role === 'WRITE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }
                      `}
                    >
                      {share.role === 'WRITE' ? 'Can edit' : 'Read only'}
                    </span>
                    <button
                      onClick={() => handleRemoveInvite(share.email)}
                      disabled={isLoading === share.email}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    >
                      {isLoading === share.email ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
