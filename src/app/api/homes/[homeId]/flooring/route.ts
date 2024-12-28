import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createFlooring, getFlooringByHome } from '@/lib/flooring.utils';
import { requireAuth } from '@/lib/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  const session = await requireAuth();
  const json = await request.json();
  const flooring = await createFlooring(session.id, json, { homeId: (await params).homeId });

  return NextResponse.json(flooring, { status: 201 });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ homeId: string }> }) {
  const session = await requireAuth();
  const flooring = await getFlooringByHome((await params).homeId, session.id);

  return NextResponse.json(flooring);
}
