import { prisma } from "./db";
import { z } from "zod";

export const homeSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
});

export type CreateHomeInput = z.infer<typeof homeSchema>;

export async function createHome(userId: string, input: CreateHomeInput) {
  const { name, address } = homeSchema.parse(input);

  const home = await prisma.home.create({
    data: {
      name,
      address,
      owner: {
        connect: { id: userId },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return home;
}

export async function getUserHomes(userId: string) {
  const homes = await prisma.home.findMany({
    where: {
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
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      shares: {
        select: {
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          rooms: true,
          tasks: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return homes;
}

export async function getHomeById(homeId: string, userId: string) {
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
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      shares: {
        select: {
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      rooms: {
        include: {
          _count: {
            select: {
              items: true,
              tasks: true,
            },
          },
        },
      },
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
      _count: {
        select: {
          rooms: true,
          tasks: true,
        },
      },
    },
  });

  if (!home) {
    throw new Error("Home not found");
  }

  return home;
}

export async function updateHome(
  homeId: string,
  userId: string,
  input: Partial<CreateHomeInput>
) {
  const home = await prisma.home.findFirst({
    where: {
      id: homeId,
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
  });

  if (!home) {
    throw new Error("Home not found or insufficient permissions");
  }

  const updatedHome = await prisma.home.update({
    where: { id: homeId },
    data: input,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedHome;
}

export async function deleteHome(homeId: string, userId: string) {
  const home = await prisma.home.findFirst({
    where: {
      id: homeId,
      userId: userId,
    },
  });

  if (!home) {
    throw new Error("Home not found or insufficient permissions");
  }

  await prisma.home.delete({
    where: { id: homeId },
  });

  return true;
}

export async function shareHome(
  homeId: string,
  userId: string,
  targetUserEmail: string,
  role: "READ" | "WRITE"
) {
  const home = await prisma.home.findFirst({
    where: {
      id: homeId,
      userId: userId,
    },
  });

  if (!home) {
    throw new Error("Home not found or insufficient permissions");
  }

  const targetUser = await prisma.user.findUnique({
    where: { email: targetUserEmail },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  if (targetUser.id === userId) {
    throw new Error("Cannot share home with yourself");
  }

  const existingShare = await prisma.homeShare.findUnique({
    where: {
      homeId_userId: {
        homeId,
        userId: targetUser.id,
      },
    },
  });

  if (existingShare) {
    throw new Error("Home already shared with this user");
  }

  const homeShare = await prisma.homeShare.create({
    data: {
      home: { connect: { id: homeId } },
      user: { connect: { id: targetUser.id } },
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return homeShare;
} 