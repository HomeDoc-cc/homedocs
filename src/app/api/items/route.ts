import { NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/session';

export async function GET() {
  const session = await requireAuth();

  const items = await prisma.item.findMany({
    where: {
      room: {
        home: {
          OR: [
            { userId: session.id },
            {
              shares: {
                some: {
                  userId: session.id,
                },
              },
            },
          ],
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(items);
} 