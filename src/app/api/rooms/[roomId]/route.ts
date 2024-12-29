import { NextRequest, NextResponse } from 'next/server';

import { deleteRoom, getRoomById, updateRoom } from '@/lib/room.utils';
import { logger, getRequestContext } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

export async function GET(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const session = await requireAuth();
    logger.info('Fetching room details', {
      ...getRequestContext(request),
      userId: session.id,
      roomId: (await params).roomId,
    });

    const room = await getRoomById((await params).roomId, session.id);

    logger.info('Room details fetched successfully', {
      userId: session.id,
      roomId: room.id,
    });

    return NextResponse.json(room);
  } catch (error) {
    logger.error('Failed to fetch room details', {
      ...getRequestContext(request),
      roomId: (await params).roomId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await requireAuth();
    logger.info('Updating room', {
      ...getRequestContext(request),
      userId: session.id,
      roomId: (await params).roomId,
    });

    const json = await request.json();
    const room = await updateRoom((await params).roomId, session.id, json);

    logger.info('Room updated successfully', {
      userId: session.id,
      roomId: room.id,
    });

    return NextResponse.json(room);
  } catch (error) {
    logger.error('Failed to update room', {
      ...getRequestContext(request),
      roomId: (await params).roomId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const session = await requireAuth();
    logger.info('Deleting room', {
      ...getRequestContext(request),
      userId: session.id,
      roomId: (await params).roomId,
    });

    await deleteRoom((await params).roomId, session.id);

    logger.info('Room deleted successfully', {
      userId: session.id,
      roomId: (await params).roomId,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('Failed to delete room', {
      ...getRequestContext(request),
      roomId: (await params).roomId,
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
