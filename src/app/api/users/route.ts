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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 5,
    });

    logger.info('Users fetched', {
      userId: session.id,
      count: users.length,
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
