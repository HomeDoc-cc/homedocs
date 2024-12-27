import { NextRequest, NextResponse } from 'next/server';

import { getItemById, updateItem } from '@/lib/item.utils';
import { requireAuth } from '@/lib/session';

export async function GET(_: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const session = await requireAuth();
  const item = await getItemById((await params).itemId, session.id);

  return NextResponse.json(item);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const item = await updateItem((await params).itemId, session.id, json);

  return NextResponse.json(item);
}
