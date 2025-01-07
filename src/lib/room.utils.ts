import { z } from 'zod';

import { prisma } from './db';

export const roomSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export type CreateRoomInput = z.infer<typeof roomSchema>;

export async function createRoom(homeId: string, userId: string, input: CreateRoomInput) {
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

  const { name, description } = roomSchema.parse(input);

  const room = await prisma.room.create({
    data: {
      name,
      description,
      home: {
        connect: { id: homeId },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      _count: {
        select: {
          items: true,
          tasks: true,
        },
      },
    },
  });

  return room;
}

export async function getRoomsByHome(homeId: string, userId: string) {
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

  const rooms = await prisma.room.findMany({
    where: {
      homeId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      _count: {
        select: {
          items: true,
          tasks: {
            where: {
              status: {
                not: 'COMPLETED'
              }
            }
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return rooms;
}

export async function getRoomById(roomId: string, userId: string) {
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
    select: {
      id: true,
      name: true,
      description: true,
      images: true,
      items: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      tasks: {
        where: {
          OR: [{ status: 'PENDING' }, { status: 'IN_PROGRESS' }],
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
      home: {
        select: {
          id: true,
          name: true,
          userId: true,
          owner: {
            select: {
              id: true,
            },
          },
          shares: {
            select: {
              role: true,
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          items: true,
          tasks: {
            where: {
              status: {
                not: 'COMPLETED'
              }
            }
          },
          paints: true,
        },
      },
    },
  });

  if (!room) {
    throw new Error('Room not found');
  }

  return room;
}

export async function updateRoom(roomId: string, userId: string, input: Partial<CreateRoomInput>) {
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

  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: input,
    select: {
      id: true,
      name: true,
      description: true,
      images: true,
      _count: {
        select: {
          items: true,
          tasks: true,
        },
      },
    },
  });

  return updatedRoom;
}

export async function deleteRoom(roomId: string, userId: string) {
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

  await prisma.room.delete({
    where: { id: roomId },
  });

  return true;
}
