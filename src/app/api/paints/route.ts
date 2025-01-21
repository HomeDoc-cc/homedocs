import { NextRequest, NextResponse } from 'next/server';

import { getRequestContext, logger } from '@/lib/logger';
import { createPaint, getPaintByHome, getPaintByRoom } from '@/lib/paint.utils';
import { requireAuth } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Fetching paints', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const { searchParams } = new URL(request.url);
    const homeId = searchParams.get('homeId');
    const roomId = searchParams.get('roomId');

    // Ensure either homeId or roomId is provided, but not both
    if ((!homeId && !roomId) || (homeId && roomId)) {
      return NextResponse.json(
        { error: 'Must provide either homeId or roomId query parameter' },
        { status: 400 }
      );
    }

    const paints = homeId
      ? await getPaintByHome(homeId, session.id)
      : await getPaintByRoom(roomId!, session.id);

    logger.info('Paints fetched successfully', {
      userId: session.id,
      count: paints.length,
    });

    return NextResponse.json(paints);
  } catch (error) {
    logger.error('Failed to fetch paints', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Creating new paint', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const json = await request.json();
    const { homeId, roomId, ...paintData } = json;

    // Ensure either homeId or roomId is provided, but not both
    if ((!homeId && !roomId) || (homeId && roomId)) {
      return NextResponse.json(
        { error: 'Must provide either homeId or roomId in request body' },
        { status: 400 }
      );
    }

    const paint = await createPaint(session.id, paintData, { homeId, roomId });

    logger.info('Paint created successfully', {
      userId: session.id,
      paintId: paint.id,
    });

    return NextResponse.json(paint, { status: 201 });
  } catch (error) {
    logger.error('Failed to create paint', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
