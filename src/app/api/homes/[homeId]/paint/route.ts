import { NextRequest, NextResponse } from 'next/server';

import { createPaint, getPaintByHome } from '@/lib/paint.utils';
import { requireAuth } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const paint = await createPaint(session.id, json, { homeId: (await params).homeId });

  return NextResponse.json(paint, { status: 201 });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ homeId: string }> }) {
  const session = await requireAuth();
  const paint = await getPaintByHome((await params).homeId, session.id);

  return NextResponse.json(paint);
}
