import { NextRequest, NextResponse } from 'next/server';

import { createUser } from '@/lib/auth.utils';

export async function POST(request: NextRequest) {
  const json = await request.json();
  const user = await createUser(json);

  return NextResponse.json({ user }, { status: 201 });
}
