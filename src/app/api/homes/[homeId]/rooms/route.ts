import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createRoom, getRoomsByHome } from '@/lib/room.utils';
import { requireAuth } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const room = await createRoom((await params).homeId, session.id, json);

  return NextResponse.json(room, { status: 201 });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ homeId: string }> }) {
  const session = await requireAuth();
  const rooms = await getRoomsByHome((await params).homeId, session.id);

  return NextResponse.json(rooms);
}
