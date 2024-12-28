import { NextRequest, NextResponse } from 'next/server';

import { createFlooring, getFlooringByRoom } from '@/lib/flooring.utils';
import { requireAuth } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const flooring = await createFlooring(session.id, json, { roomId: (await params).roomId });

  return NextResponse.json(flooring, { status: 201 });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const session = await requireAuth();
  const flooring = await getFlooringByRoom((await params).roomId, session.id);

  return NextResponse.json(flooring);
}
