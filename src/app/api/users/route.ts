import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/session';

export async function GET() {
  try {
    const user = await requireAuth();

    // Get all users that are either owners or members of homes that the current user has access to
    const users = await prisma.user.findMany({
      where: {
        OR: [
          // Users who own homes that the current user has access to
          {
            ownedHomes: {
              some: {
                OR: [
                  { userId: user.id },
                  {
                    shares: {
                      some: {
                        userId: user.id,
                      },
                    },
                  },
                ],
              },
            },
          },
          // Users who have shared access to homes that the current user has access to
          {
            sharedHomes: {
              some: {
                home: {
                  OR: [
                    { userId: user.id },
                    {
                      shares: {
                        some: {
                          userId: user.id,
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      distinct: ['id'], // Ensure no duplicate users
    });

    return NextResponse.json(users);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
