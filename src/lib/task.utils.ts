import { prisma } from "./db";
import { z } from "zod";
import { TaskPriority, TaskStatus } from "@/types/prisma";

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional(),
  homeId: z.string().optional(),
  roomId: z.string().optional(),
  itemId: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof taskSchema>;

export async function getRecentTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { assigneeId: userId },
      ],
      status: {
        in: ["PENDING", "IN_PROGRESS"],
      },
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
      home: {
        select: {
          id: true,
          name: true,
        },
      },
      room: {
        select: {
          id: true,
          name: true,
        },
      },
      item: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return tasks;
}

export async function createTask(
  userId: string,
  input: CreateTaskInput
) {
  // Ensure only one of homeId, roomId, or itemId is provided
  const locationCount = [input.homeId, input.roomId, input.itemId].filter(Boolean).length;
  if (locationCount !== 1) {
    throw new Error("Must provide exactly one of homeId, roomId, or itemId");
  }

  // Check if user has access to the home/room/item
  if (input.homeId) {
    const home = await prisma.home.findFirst({
      where: {
        id: input.homeId,
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
  }

  if (input.roomId) {
    const room = await prisma.room.findFirst({
      where: {
        id: input.roomId,
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
      include: {
        home: true,
      },
    });

    if (!room) {
      throw new Error("Room not found or insufficient permissions");
    }

    // Set the homeId when creating a task for a room
    input.homeId = room.home.id;
  }

  if (input.itemId) {
    const item = await prisma.item.findFirst({
      where: {
        id: input.itemId,
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
      include: {
        room: {
          include: {
            home: true
          }
        }
      }
    });

    if (!item) {
      throw new Error("Item not found or insufficient permissions");
    }

    // Set both homeId and roomId when creating a task for an item
    input.homeId = item.room.home.id;
    input.roomId = item.room.id;
  }

  // Remove the locationCount check since we now allow multiple locations for item tasks
  if (!input.homeId) {
    throw new Error("Home ID is required");
  }

  // If assigneeId is provided, verify the user exists and has access to the home
  if (input.assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: {
        id: input.assigneeId,
        OR: [
          {
            ownedHomes: {
              some: input.homeId ? { id: input.homeId } : input.roomId ? {
                rooms: { some: { id: input.roomId } }
              } : {
                rooms: { some: { items: { some: { id: input.itemId } } } }
              }
            }
          },
          {
            sharedHomes: {
              some: input.homeId ? { homeId: input.homeId } : input.roomId ? {
                home: { rooms: { some: { id: input.roomId } } }
              } : {
                home: { rooms: { some: { items: { some: { id: input.itemId } } } } }
              }
            }
          }
        ]
      }
    });

    if (!assignee) {
      throw new Error("Assignee not found or does not have access to this location");
    }
  }

  const task = await prisma.task.create({
    data: {
      ...taskSchema.parse(input),
      creatorId: userId,
    },
    include: {
      creator: true,
      assignee: true,
      home: true,
      room: true,
      item: true,
    },
  });

  return task;
}

export async function getTasksByHome(homeId: string, userId: string) {
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
    throw new Error("Home not found or insufficient permissions");
  }

  const tasks = await prisma.task.findMany({
    where: {
      homeId,
    },
    include: {
      creator: true,
      assignee: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks;
}

export async function getTasksByRoom(roomId: string, userId: string) {
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

  const tasks = await prisma.task.findMany({
    where: {
      roomId,
    },
    include: {
      creator: true,
      assignee: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks;
}

export async function getTasksByItem(itemId: string, userId: string) {
  // Check if user has access to the item
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
  });

  if (!item) {
    throw new Error("Item not found or insufficient permissions");
  }

  const tasks = await prisma.task.findMany({
    where: {
      itemId,
    },
    include: {
      creator: true,
      assignee: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks;
}

export async function updateTask(
  taskId: string,
  userId: string,
  input: Partial<CreateTaskInput>
) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      OR: [
        { creatorId: userId },
        {
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
        {
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
        {
          item: {
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
        },
      ],
    },
  });

  if (!task) {
    throw new Error("Task not found or insufficient permissions");
  }

  // If assigneeId is being updated, verify the new assignee exists and has access
  if (input.assigneeId && input.assigneeId !== task.assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: {
        id: input.assigneeId,
        OR: [
          {
            ownedHomes: {
              some: task.homeId ? { id: task.homeId } : task.roomId ? {
                rooms: { some: { id: task.roomId } }
              } : {
                rooms: { some: { items: { some: { id: task.itemId! } } } }
              }
            }
          },
          {
            sharedHomes: {
              some: task.homeId ? { homeId: task.homeId } : task.roomId ? {
                home: { rooms: { some: { id: task.roomId } } }
              } : {
                home: { rooms: { some: { items: { some: { id: task.itemId! } } } } }
              }
            }
          }
        ]
      }
    });

    if (!assignee) {
      throw new Error("Assignee not found or does not have access to this location");
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: input,
    include: {
      creator: true,
      assignee: true,
      home: true,
      room: true,
      item: true,
    },
  });

  return updatedTask;
}

export async function deleteTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      OR: [
        { creatorId: userId },
        {
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
        {
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
        {
          item: {
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
        },
      ],
    },
  });

  if (!task) {
    throw new Error("Task not found or insufficient permissions");
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return true;
}

export async function getAllTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        {
          creator: {
            id: userId,
          },
        },
        {
          assignee: {
            id: userId,
          },
        },
        {
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
        {
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
        {
          item: {
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
        },
      ],
    },
    include: {
      creator: true,
      assignee: true,
      home: {
        select: {
          id: true,
          name: true,
        },
      },
      room: {
        select: {
          id: true,
          name: true,
        },
      },
      item: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks;
} 