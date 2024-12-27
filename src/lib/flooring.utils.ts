import { z } from 'zod';

import { prisma } from './db';

export const flooringSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  material: z.string().min(1),
  brand: z.string(),
  color: z.string().nullable(),
  pattern: z.string().nullable(),
  notes: z.string().nullable(),
});

export type CreateFlooringInput = z.infer<typeof flooringSchema>;

export async function createFlooring(
  userId: string,
  input: CreateFlooringInput,
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
          { userId },
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
            { userId },
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

  const parsedInput = flooringSchema.parse(input);
  const flooring = await prisma.flooring.create({
    data: {
      name: parsedInput.name,
      type: parsedInput.type,
      material: parsedInput.material,
      brand: parsedInput.brand,
      color: parsedInput.color,
      pattern: parsedInput.pattern,
      notes: parsedInput.notes,
      ...(homeId ? { home: { connect: { id: homeId } } } : {}),
      ...(roomId ? { room: { connect: { id: roomId } } } : {}),
    },
  });

  return flooring;
}

export async function getFlooringByHome(homeId: string, userId: string) {
  // Check if user has access to the home
  const home = await prisma.home.findFirst({
    where: {
      id: homeId,
      OR: [
        { userId },
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

  const flooring = await prisma.flooring.findMany({
    where: {
      homeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return flooring;
}

export async function getFlooringByRoom(roomId: string, userId: string) {
  // Check if user has access to the room
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      home: {
        OR: [
          { userId },
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

  const flooring = await prisma.flooring.findMany({
    where: {
      roomId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return flooring;
}

export async function updateFlooring(
  flooringId: string,
  userId: string,
  input: Partial<CreateFlooringInput>
) {
  const flooring = await prisma.flooring.findFirst({
    where: {
      id: flooringId,
      OR: [
        {
          home: {
            OR: [
              { userId },
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
                { userId },
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

  if (!flooring) {
    throw new Error('Flooring not found or insufficient permissions');
  }

  const updatedFlooring = await prisma.flooring.update({
    where: { id: flooringId },
    data: input,
  });

  return updatedFlooring;
}

export async function deleteFlooring(flooringId: string, userId: string) {
  const flooring = await prisma.flooring.findFirst({
    where: {
      id: flooringId,
      OR: [
        {
          home: {
            OR: [
              { userId },
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
                { userId },
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

  if (!flooring) {
    throw new Error('Flooring not found or insufficient permissions');
  }

  await prisma.flooring.delete({
    where: { id: flooringId },
  });
}
