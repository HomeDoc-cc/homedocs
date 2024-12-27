import { z } from 'zod';

import { prisma } from './db';

export const paintSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  color: z.string().min(1),
  finish: z.string().min(1),
  code: z.string().optional(),
  location: z.string().min(1),
  notes: z.string().optional(),
});

export type CreatePaintInput = z.infer<typeof paintSchema>;

export async function createPaint(
  userId: string,
  input: CreatePaintInput,
  { homeId, roomId }: { homeId?: string; roomId?: string }
) {
  // Ensure either homeId or roomId is provided, but not both
  if ((!homeId && !roomId) || (homeId && roomId)) {
    throw new Error('Must provide either homeId or roomId');
  }

  // Check if user has access to the home/room
  if (homeId) {
    const home = await prisma.home.findFirst({
      where: {
        id: homeId,
        OR: [
          { userId: userId },
          {
            shares: {
              some: {
                userId,
                role: 'WRITE',
              },
            },
          },
        ],
      },
    });

    if (!home) {
      throw new Error('Home not found or insufficient permissions');
    }
  }

  if (roomId) {
    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        home: {
          OR: [
            { userId: userId },
            {
              shares: {
                some: {
                  userId,
                  role: 'WRITE',
                },
              },
            },
          ],
        },
      },
    });

    if (!room) {
      throw new Error('Room not found or insufficient permissions');
    }
  }

  const paint = await prisma.paint.create({
    data: {
      ...paintSchema.parse(input),
      ...(homeId ? { home: { connect: { id: homeId } } } : {}),
      ...(roomId ? { room: { connect: { id: roomId } } } : {}),
    },
  });

  return paint;
}

export async function getPaintByHome(homeId: string, userId: string) {
  // Check if user has access to the home
  const home = await prisma.home.findFirst({
    where: {
      id: homeId,
      OR: [
        { userId: userId },
        {
          shares: {
            some: {
              userId,
            },
          },
        },
      ],
    },
  });

  if (!home) {
    throw new Error('Home not found or insufficient permissions');
  }

  const paint = await prisma.paint.findMany({
    where: {
      homeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return paint;
}

export async function getPaintByRoom(roomId: string, userId: string) {
  // Check if user has access to the room
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      home: {
        OR: [
          { userId: userId },
          {
            shares: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    },
  });

  if (!room) {
    throw new Error('Room not found or insufficient permissions');
  }

  const paint = await prisma.paint.findMany({
    where: {
      roomId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return paint;
}

export async function updatePaint(
  paintId: string,
  userId: string,
  input: Partial<CreatePaintInput>
) {
  const paint = await prisma.paint.findFirst({
    where: {
      id: paintId,
      OR: [
        {
          home: {
            OR: [
              { userId: userId },
              {
                shares: {
                  some: {
                    userId,
                    role: 'WRITE',
                  },
                },
              },
            ],
          },
        },
        {
          room: {
            home: {
              OR: [
                { userId: userId },
                {
                  shares: {
                    some: {
                      userId,
                      role: 'WRITE',
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  });

  if (!paint) {
    throw new Error('Paint not found or insufficient permissions');
  }

  const updatedPaint = await prisma.paint.update({
    where: { id: paintId },
    data: input,
  });

  return updatedPaint;
}

export async function deletePaint(paintId: string, userId: string) {
  const paint = await prisma.paint.findFirst({
    where: {
      id: paintId,
      OR: [
        {
          home: {
            OR: [
              { userId: userId },
              {
                shares: {
                  some: {
                    userId,
                    role: 'WRITE',
                  },
                },
              },
            ],
          },
        },
        {
          room: {
            home: {
              OR: [
                { userId: userId },
                {
                  shares: {
                    some: {
                      userId,
                      role: 'WRITE',
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  });

  if (!paint) {
    throw new Error('Paint not found or insufficient permissions');
  }

  await prisma.paint.delete({
    where: { id: paintId },
  });

  return true;
}
