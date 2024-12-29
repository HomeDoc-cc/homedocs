import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { getRequestContext, logger } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Fetching all rooms', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const rooms = await prisma.room.findMany({
      where: {
        home: {
          OR: [
            { userId: session.id },
            {
              shares: {
                some: {
                  userId: session.id,
                },
              },
            },
          ],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    logger.info('Rooms fetched successfully', {
      userId: session.id,
      count: rooms.length,
    });

    return NextResponse.json(rooms);
  } catch (error) {
    logger.error('Failed to fetch rooms', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
