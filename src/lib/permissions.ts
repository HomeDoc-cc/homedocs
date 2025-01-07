export function hasWriteAccess(
  userId: string | undefined,
  home: {
    owner: { id: string };
    shares: Array<{ role: 'READ' | 'WRITE'; user: { id: string } }>;
  }
): boolean {
  if (!userId) return false;

  // Owner always has write access
  if (home.owner.id === userId) return true;

  // Check if user has a WRITE share
  return home.shares.some((share) => share.user.id === userId && share.role === 'WRITE');
}
