import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { deleteHome, getHomeById, updateHome } from '@/lib/home.utils';
import { requireAuth } from '@/lib/session';

export async function GET(_: NextRequest, { params }: { params: Promise<{ homeId: string }> }) {
  const session = await requireAuth();
  const home = await getHomeById((await params).homeId, session.id);

  return NextResponse.json(home);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const home = await updateHome((await params).homeId, session.id, json);

  return NextResponse.json(home);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ homeId: string }> }) {
  const session = await requireAuth();
  await deleteHome((await params).homeId, session.id);

  return new NextResponse(null, { status: 204 });
}
