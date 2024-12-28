import { NextRequest, NextResponse } from 'next/server';

import { createPaint, getPaintByRoom } from '@/lib/paint.utils';
import { requireAuth } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const paint = await createPaint(session.id, json, { roomId: (await params).roomId });

  return NextResponse.json(paint, { status: 201 });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const session = await requireAuth();
  const paint = await getPaintByRoom((await params).roomId, session.id);

  return NextResponse.json(paint);
}
