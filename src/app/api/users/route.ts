import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { getRequestContext, logger } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Fetching users', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const searchParams = new URL(request.url).searchParams;
    const homeId = searchParams.get('homeId');

    // Get all homes the current user has access to
    const userHomes = await prisma.home.findMany({
      where: {
        OR: [{ userId: session.id }, { shares: { some: { userId: session.id } } }],
      },
      select: { id: true },
    });

    const homeIds = userHomes.map((home) => home.id);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          // If a specific homeId is provided, only include users with access to that home
          ...(homeId
            ? [{ ownedHomes: { some: { id: homeId } } }, { sharedHomes: { some: { homeId } } }]
            : [
                // Otherwise, include users who share any homes with the current user
                { ownedHomes: { some: { id: { in: homeIds } } } },
                { sharedHomes: { some: { homeId: { in: homeIds } } } },
              ]),
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    logger.info('Users fetched', {
      userId: session.id,
      count: users.length,
      homeId,
    });

    return NextResponse.json(users);
  } catch (error) {
    logger.error('Failed to fetch users', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
