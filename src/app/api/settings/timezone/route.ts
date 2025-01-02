import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { timezone: true },
  });

  return NextResponse.json({ timezone: user?.timezone || 'UTC' });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    logger.warn('Unauthorized timezone update attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    logger.warn('Invalid JSON in timezone update request');
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { timezone } = body;
  if (!timezone) {
    logger.warn('Missing timezone in update request');
    return NextResponse.json({ error: 'Timezone is required' }, { status: 400 });
  }

  // Validate timezone using Intl API
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch {
    logger.warn('Invalid timezone provided', { timezone });
    return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { timezone },
    });

    logger.info('Timezone updated successfully', { 
      userId: session.user.email,
      timezone 
    });
    return NextResponse.json({ timezone });
  } catch (error) {
    logger.error('Failed to update timezone', { 
      userId: session.user.email,
      timezone,
      error: error as Error
    });
    return NextResponse.json({ error: 'Failed to update timezone' }, { status: 500 });
  }
}
