import { NextRequest, NextResponse } from 'next/server';

import { createItem, getItemsByRoom } from '@/lib/item.utils';
import { requireAuth } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const item = await createItem((await params).roomId, session.id, json);

  return NextResponse.json(item, { status: 201 });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const session = await requireAuth();
  const items = await getItemsByRoom((await params).roomId, session.id);

  return NextResponse.json(items);
}
