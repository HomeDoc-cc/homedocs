import { NextRequest, NextResponse } from 'next/server';

import { createHome, getUserHomes } from '@/lib/home.utils';
import { logger, getRequestContext } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Creating new home', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const json = await request.json();
    const home = await createHome(session.id, json);

    logger.info('Home created successfully', {
      userId: session.id,
      homeId: home.id,
    });

    return NextResponse.json(home, { status: 201 });
  } catch (error) {
    logger.error('Failed to create home', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Fetching user homes', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const homes = await getUserHomes(session.id);

    logger.info('Homes fetched successfully', {
      userId: session.id,
      count: homes.length,
    });

    return NextResponse.json(homes);
  } catch (error) {
    logger.error('Failed to fetch homes', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
