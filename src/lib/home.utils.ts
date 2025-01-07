import { randomBytes } from 'crypto';
import { z } from 'zod';

import { prisma } from './db';
import { sendHomeShareInviteEmail } from './email';

export const homeSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
});

export type CreateHomeInput = z.infer<typeof homeSchema>;

export async function createHome(userId: string, input: CreateHomeInput) {
  const { name, address } = homeSchema.parse(input);

  // Get the user's tier and existing homes count
  const [user, homeCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    }),
    prisma.home.count({
      where: { userId },
    }),
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  // Free tier users can only create one home
  if (user.tier === 'FREE' && homeCount >= 1) {
    throw new Error('Free tier users can only create one home');
  }

  const home = await prisma.home.create({
    data: {
      name,
      address,
      owner: {
        connect: { id: userId },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return home;
}

export async function getUserHomes(userId: string) {
  const homes = await prisma.home.findMany({
    where: {
      OR: [
        { userId: userId },
        {
          shares: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      shares: {
        select: {
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          rooms: true,
          tasks: {
            where: {
              status: {
                not: 'COMPLETED'
              }
            }
          },
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return homes;
}

export async function getHomeById(homeId: string, userId: string) {
  const home = await prisma.home.findFirst({
    where: {
      id: homeId,
      OR: [
        { userId: userId },
        {
          shares: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      shares: {
        select: {
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      pendingShares: {
        select: {
          email: true,
          role: true,
          createdAt: true,
          expiresAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      rooms: {
        include: {
          _count: {
            select: {
              items: true,
              tasks: true,
            },
          },
        },
      },
      tasks: {
        where: {
          OR: [{ status: 'PENDING' }, { status: 'IN_PROGRESS' }],
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
      _count: {
        select: {
          rooms: true,
          tasks: true,
          items: true,
        },
      },
    },
  });

  if (!home) {
    throw new Error('Home not found');
  }

  return home;
}

export async function updateHome(homeId: string, userId: string, input: Partial<CreateHomeInput>) {
  const home = await prisma.home.findFirst({
    where: {
      id: homeId,
      OR: [
        { userId: userId },
        {
          shares: {
            some: {
              userId,
              role: 'WRITE',
            },
          },
        },
      ],
    },
  });

  if (!home) {
    throw new Error('Home not found or insufficient permissions');
  }

  const updatedHome = await prisma.home.update({
    where: { id: homeId },
    data: input,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedHome;
}

export async function deleteHome(homeId: string, userId: string) {
  const home = await prisma.home.findFirst({
    where: {
      id: homeId,
      userId: userId,
    },
  });

  if (!home) {
    throw new Error('Home not found or insufficient permissions');
  }

  await prisma.home.delete({
    where: { id: homeId },
  });

  return true;
}

export async function shareHome(
  homeId: string,
  userId: string,
  targetUserEmail: string,
  role: 'READ' | 'WRITE'
) {
  const home = await prisma.home.findFirst({
    where: {
      id: homeId,
      userId: userId,
    },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!home) {
    throw new Error('Home not found or insufficient permissions');
  }

  const targetUser = await prisma.user.findUnique({
    where: { email: targetUserEmail },
  });

  if (targetUser?.id === userId) {
    throw new Error('Cannot share home with yourself');
  }

  // Check for existing share or pending share
  const [existingShare, existingPendingShare] = await Promise.all([
    targetUser
      ? prisma.homeShare.findUnique({
          where: {
            homeId_userId: {
              homeId,
              userId: targetUser.id,
            },
          },
        })
      : null,
    prisma.pendingHomeShare.findUnique({
      where: {
        homeId_email: {
          homeId,
          email: targetUserEmail,
        },
      },
    }),
  ]);

  if (existingShare) {
    throw new Error('Home already shared with this user');
  }

  if (existingPendingShare) {
    throw new Error('Pending invitation already exists for this email');
  }

  // Generate a secure random token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  if (targetUser) {
    // User exists, create a direct share
    const homeShare = await prisma.homeShare.create({
      data: {
        home: { connect: { id: homeId } },
        user: { connect: { id: targetUser.id } },
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Send email notification for existing user
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/homes/${homeId}`;
    const invitedBy = home.owner.name || home.owner.email || 'A user';

    await sendHomeShareInviteEmail(targetUserEmail, home.name, inviteUrl, invitedBy);

    return homeShare;
  } else {
    // User doesn't exist, create a pending share
    const pendingShare = await prisma.pendingHomeShare.create({
      data: {
        home: { connect: { id: homeId } },
        email: targetUserEmail,
        role,
        token,
        expiresAt,
      },
    });

    // Send email notification with signup link for new user
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept/${token}`;
    const invitedBy = home.owner.name || home.owner.email || 'A user';

    await sendHomeShareInviteEmail(targetUserEmail, home.name, inviteUrl, invitedBy);

    return pendingShare;
  }
}
