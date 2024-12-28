import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { deleteRoom, getRoomById, updateRoom } from '@/lib/room.utils';
import { requireAuth } from '@/lib/session';

export async function GET(_: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const session = await requireAuth();
  const room = await getRoomById((await params).roomId, session.id);

  return NextResponse.json(room);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const room = await updateRoom((await params).roomId, session.id, json);

  return NextResponse.json(room);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const session = await requireAuth();
  await deleteRoom((await params).roomId, session.id);

  return new NextResponse(null, { status: 204 });
}
