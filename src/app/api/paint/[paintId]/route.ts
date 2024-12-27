import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { deletePaint, updatePaint } from '@/lib/paint.utils';
import { requireAuth } from '@/lib/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ paintId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const paint = await updatePaint((await params).paintId, session.id, json);

  return NextResponse.json(paint);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ paintId: string }> }) {
  const session = await requireAuth();
  await deletePaint((await params).paintId, session.id);

  return new NextResponse(null, { status: 204 });
}
