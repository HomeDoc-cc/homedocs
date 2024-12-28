import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/session';

// Generate a secure random token
function generateToken() {
  return randomBytes(32).toString('hex');
}

export async function GET(request: NextRequest) {
  const session = await requireAuth();

  const calendarToken = await prisma.calendarToken.findUnique({
    where: {
      userId: session.id,
    },
  });

  if (!calendarToken) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.json({ token: calendarToken.token });
}

export async function POST(request: NextRequest) {
  const session = await requireAuth();

  // Generate a new token
  const token = generateToken();

  // Create or update the calendar token
  const calendarToken = await prisma.calendarToken.upsert({
    where: {
      userId: session.id,
    },
    update: {
      token,
      updatedAt: new Date(),
    },
    create: {
      userId: session.id,
      token,
    },
  });

  return NextResponse.json({ token: calendarToken.token });
}

export async function DELETE(request: NextRequest) {
  const session = await requireAuth();

  // Delete the calendar token
  await prisma.calendarToken.delete({
    where: {
      userId: session.id,
    },
  });

  return new NextResponse(null, { status: 204 });
} 