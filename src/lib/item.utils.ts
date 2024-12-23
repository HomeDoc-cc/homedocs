import { prisma } from "./db";
import { z } from "zod";

export const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  warrantyUntil: z.string().datetime().optional(),
  manualUrl: z.string().url().optional(),
});

export type CreateItemInput = z.infer<typeof itemSchema>;

export async function createItem(roomId: string, userId: string, input: CreateItemInput) {
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
                role: "WRITE",
              },
            },
          },
        ],
      },
    },
  });

  if (!room) {
    throw new Error("Room not found or insufficient permissions");
  }

  const { 
    purchaseDate,
    warrantyUntil,
    ...rest
  } = itemSchema.parse(input);

  const item = await prisma.item.create({
    data: {
      ...rest,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      warrantyUntil: warrantyUntil ? new Date(warrantyUntil) : undefined,
      room: {
        connect: { id: roomId },
      },
      home: {
        connect: { id: room.homeId },
      },
    },
  });

  return item;
}

export async function getItemsByRoom(roomId: string, userId: string) {
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
    throw new Error("Room not found or insufficient permissions");
  }

  const items = await prisma.item.findMany({
    where: {
      roomId,
    },
    include: {
      tasks: {
        where: {
          OR: [
            { status: "PENDING" },
            { status: "IN_PROGRESS" },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items;
}

export async function getItemById(itemId: string, userId: string) {
  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      room: {
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
    },
    include: {
      tasks: {
        orderBy: {
          createdAt: "desc",
        },
      },
      room: {
        select: {
          id: true,
          name: true,
          home: {
            select: {
              id: true,
              name: true,
              userId: true,
            },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  if (!item) {
    throw new Error("Item not found");
  }

  return item;
}

export async function updateItem(
  itemId: string,
  userId: string,
  input: Partial<CreateItemInput>
) {
  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      room: {
        home: {
          OR: [
            { userId: userId },
            {
              shares: {
                some: {
                  userId,
                  role: "WRITE",
                },
              },
            },
          ],
        },
      },
    },
  });

  if (!item) {
    throw new Error("Item not found or insufficient permissions");
  }

  const { 
    purchaseDate,
    warrantyUntil,
    ...rest
  } = input;

  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: {
      ...rest,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      warrantyUntil: warrantyUntil ? new Date(warrantyUntil) : undefined,
    },
  });

  return updatedItem;
}

export async function deleteItem(itemId: string, userId: string) {
  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      room: {
        home: {
          OR: [
            { userId: userId },
            {
              shares: {
                some: {
                  userId,
                  role: "WRITE",
                },
              },
            },
          ],
        },
      },
    },
  });

  if (!item) {
    throw new Error("Item not found or insufficient permissions");
  }

  await prisma.item.delete({
    where: { id: itemId },
  });

  return true;
} 