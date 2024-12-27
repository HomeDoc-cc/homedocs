import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createHome, getUserHomes } from '@/lib/home.utils';
import { requireAuth } from '@/lib/session';

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  const json = await request.json();
  const home = await createHome(session.id, json);

  return NextResponse.json(home, { status: 201 });
}

export async function GET() {
  const session = await requireAuth();
  const homes = await getUserHomes(session.id);

  return NextResponse.json(homes);
}
