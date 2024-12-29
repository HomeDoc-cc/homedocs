import { NextRequest, NextResponse } from 'next/server';

import { createRoom, getRoomsByHome } from '@/lib/room.utils';
import { logger, getRequestContext } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Creating new room', {
      ...getRequestContext(request),
      userId: session.id,
      homeId: (await params).homeId,
    });

    const json = await request.json();
    const room = await createRoom((await params).homeId, session.id, json);

    logger.info('Room created successfully', {
      userId: session.id,
      homeId: (await params).homeId,
      roomId: room.id,
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    logger.error('Failed to create room', {
      ...getRequestContext(request),
      homeId: (await params).homeId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ homeId: string }> }) {
  try {
    const session = await requireAuth();
    logger.info('Fetching rooms for home', {
      ...getRequestContext(request),
      userId: session.id,
      homeId: (await params).homeId,
    });

    const rooms = await getRoomsByHome((await params).homeId, session.id);

    logger.info('Rooms fetched successfully', {
      userId: session.id,
      homeId: (await params).homeId,
      count: rooms.length,
    });

    return NextResponse.json(rooms);
  } catch (error) {
    logger.error('Failed to fetch rooms', {
      ...getRequestContext(request),
      homeId: (await params).homeId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
