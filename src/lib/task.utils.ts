import { addDays, addMonths, addWeeks, addYears } from 'date-fns';
import { z } from 'zod';

import { Task, TaskPriority, TaskRecurrenceUnit, TaskStatus } from '@/types/prisma';

import { prisma } from './db';

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || ''),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  dueDate: z.string().datetime().nullable().optional(),
  assigneeId: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || undefined),
  homeId: z.string().nullable().optional(),
  roomId: z.string().nullable().optional(),
  itemId: z.string().nullable().optional(),
  // Recurring task fields
  isRecurring: z.boolean().default(false),
  interval: z.number().positive().nullable().optional(),
  unit: z.nativeEnum(TaskRecurrenceUnit).nullable().optional(),
  nextDueDate: z.date().nullable().optional(),
  lastCompleted: z.date().nullable().optional(),
  parentTaskId: z.string().nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof taskSchema>;

function calculateNextDueDate(
  completionDate: Date,
  interval: number,
  unit: TaskRecurrenceUnit,
  timezone: string
): Date {
  // Convert the completion date to the user's timezone
  const localDate = new Date(completionDate.toLocaleString('en-US', { timeZone: timezone }));

  let nextDate: Date;
  switch (unit) {
    case TaskRecurrenceUnit.DAILY:
      nextDate = addDays(localDate, interval);
      break;
    case TaskRecurrenceUnit.WEEKLY:
      nextDate = addWeeks(localDate, interval);
      break;
    case TaskRecurrenceUnit.MONTHLY:
      nextDate = addMonths(localDate, interval);
      break;
    case TaskRecurrenceUnit.YEARLY:
      nextDate = addYears(localDate, interval);
      break;
    default:
      throw new Error('Invalid recurrence unit');
  }

  // Convert back to UTC for storage
  return new Date(nextDate.toLocaleString('en-US', { timeZone: 'UTC' }));
}

export async function getRecentTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ creatorId: userId }, { assigneeId: userId }],
      status: {
        in: ['PENDING', 'IN_PROGRESS'],
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
          homeId: true,
          home: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      item: {
        select: {
          id: true,
          name: true,
          roomId: true,
          room: {
            select: {
              id: true,
              name: true,
              homeId: true,
              home: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  return tasks as Task[];
}

// Convert a date from local timezone to UTC
function convertToUTC(date: string): string {
  // Create a date object in the user's timezone
  const localDate = new Date(date);
  // Get the UTC time that corresponds to that local time
  const utcDate = new Date(localDate.toLocaleString('en-US', { timeZone: 'UTC' }));
  return utcDate.toISOString();
}

export async function createTask(userId: string, input: CreateTaskInput) {
  // Get user's timezone
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const timezone = user?.timezone || 'UTC';

  // Determine the most specific location ID
  let locationId: { itemId?: string; roomId?: string; homeId?: string } = {};

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
                    role: 'WRITE',
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
            home: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new Error('Item not found or insufficient permissions');
    }

    locationId = {
      itemId: item.id,
      roomId: item.roomId,
      homeId: item.room.homeId,
    };
  } else if (input.roomId) {
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
                  role: 'WRITE',
                },
              },
            },
          ],
        },
      },
      include: {
        home: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new Error('Room not found or insufficient permissions');
    }

    locationId = {
      roomId: room.id,
      homeId: room.homeId,
    };
  } else if (input.homeId) {
    const home = await prisma.home.findFirst({
      where: {
        id: input.homeId,
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

    if (!home) {
      throw new Error('Home not found or insufficient permissions');
    }

    locationId = {
      homeId: home.id,
    };
  } else {
    throw new Error('Must provide one of itemId, roomId, or homeId');
  }

  // Validate recurring task fields
  if (input.isRecurring) {
    if (!input.interval || !input.unit || !input.dueDate) {
      throw new Error('Recurring tasks must have an interval, unit, and due date');
    }
  }

  // If assigneeId is provided, verify the user exists and has access to the home
  if (input.assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: {
        id: input.assigneeId,
        OR: [
          {
            ownedHomes: {
              some: locationId.homeId ? { id: locationId.homeId } : undefined,
            },
          },
          {
            sharedHomes: {
              some: locationId.homeId ? { homeId: locationId.homeId } : undefined,
            },
          },
        ],
      },
    });

    if (!assignee) {
      throw new Error('Assignee not found or does not have access to this location');
    }
  }

  const taskData = {
    ...taskSchema.parse({
      ...input,
      ...locationId, // Override with the correct location IDs
    }),
    creatorId: userId,
  };

  // For recurring tasks, set the nextDueDate
  if (input.isRecurring && input.dueDate && input.interval && input.unit) {
    const dueDate = new Date(input.dueDate);
    const nextDueDate = calculateNextDueDate(dueDate, input.interval, input.unit, timezone);
    taskData.nextDueDate = nextDueDate;
  }

  // Convert dueDate to UTC for storage if it exists
  if (taskData.dueDate) {
    taskData.dueDate = convertToUTC(taskData.dueDate);
  }

  const task = await prisma.task.create({
    data: taskData,
    include: {
      creator: true,
      assignee: true,
      home: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      room: {
        include: {
          home: {
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      item: {
        include: {
          room: {
            include: {
              home: {
                include: {
                  owner: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
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
    throw new Error('Home not found or insufficient permissions');
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
      createdAt: 'desc',
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
    throw new Error('Room not found or insufficient permissions');
  }

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { roomId },
        {
          item: {
            roomId,
          },
        },
      ],
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
          homeId: true,
          home: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      item: {
        select: {
          id: true,
          name: true,
          roomId: true,
          room: {
            select: {
              id: true,
              name: true,
              homeId: true,
              home: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
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
    throw new Error('Item not found or insufficient permissions');
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
      createdAt: 'desc',
    },
  });

  return tasks;
}

export async function updateTask(taskId: string, userId: string, input: Partial<CreateTaskInput>) {
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
                    role: 'WRITE',
                  },
                },
              },
            ],
          },
        },
      ],
    },
  });

  if (!task) {
    throw new Error('Task not found or insufficient permissions');
  }

  // Handle location updates
  let locationId: { itemId?: string; roomId?: string; homeId?: string } = {};

  if ('itemId' in input || 'roomId' in input || 'homeId' in input) {
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
                      role: 'WRITE',
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
              home: {
                include: {
                  owner: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!item) {
        throw new Error('Item not found or insufficient permissions');
      }

      locationId = {
        itemId: item.id,
        roomId: item.roomId,
        homeId: item.room.homeId,
      };
    } else if (input.roomId) {
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
                    role: 'WRITE',
                  },
                },
              },
            ],
          },
        },
        include: {
          home: {
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!room) {
        throw new Error('Room not found or insufficient permissions');
      }

      locationId = {
        roomId: room.id,
        homeId: room.homeId,
      };
    } else if (input.homeId) {
      const home = await prisma.home.findFirst({
        where: {
          id: input.homeId,
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

      if (!home) {
        throw new Error('Home not found or insufficient permissions');
      }

      locationId = {
        homeId: home.id,
      };
    }
  }

  // If assigneeId is being updated, verify the new assignee exists and has access
  if (input.assigneeId && input.assigneeId !== task.assigneeId) {
    const targetHomeId = locationId.homeId || task.homeId;
    const assignee = await prisma.user.findFirst({
      where: {
        id: input.assigneeId,
        OR: targetHomeId
          ? [
              {
                ownedHomes: {
                  some: { id: targetHomeId },
                },
              },
              {
                sharedHomes: {
                  some: { homeId: targetHomeId },
                },
              },
            ]
          : undefined,
      },
    });

    if (!assignee) {
      throw new Error('Assignee not found or does not have access to this location');
    }
  }

  // Convert dueDate to UTC if it's being updated
  const updateData = { ...input };
  if (updateData.dueDate) {
    updateData.dueDate = convertToUTC(updateData.dueDate);
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...updateData,
      ...locationId,
    },
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
                        role: 'WRITE',
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
    throw new Error('Task not found or insufficient permissions');
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return true;
}

export async function getAllTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ creatorId: userId }, { assigneeId: userId }],
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
          homeId: true,
          home: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      item: {
        select: {
          id: true,
          name: true,
          roomId: true,
          room: {
            select: {
              id: true,
              name: true,
              homeId: true,
              home: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return tasks as Task[];
}

export async function completeTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      OR: [
        { creatorId: userId },
        { assigneeId: userId },
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
      ],
    },
  });

  if (!task) {
    throw new Error('Task not found or insufficient permissions');
  }

  // Get user's timezone
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  const timezone = user?.timezone || 'UTC';

  // Update the current task
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: TaskStatus.COMPLETED,
      lastCompleted: new Date(),
    },
  });

  // If this is a recurring task, create the next occurrence
  if (task.isRecurring && task.interval && task.unit && task.dueDate) {
    const nextDueDate = calculateNextDueDate(
      new Date(),
      task.interval,
      task.unit as TaskRecurrenceUnit,
      timezone
    );

    await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: TaskStatus.PENDING,
        dueDate: nextDueDate.toISOString(),
        isRecurring: true,
        interval: task.interval,
        unit: task.unit,
        nextDueDate: calculateNextDueDate(
          nextDueDate,
          task.interval,
          task.unit as TaskRecurrenceUnit,
          timezone
        ),
        homeId: task.homeId,
        roomId: task.roomId,
        itemId: task.itemId,
        creatorId: task.creatorId,
        assigneeId: task.assigneeId,
        parentTaskId: task.parentTaskId || task.id,
      },
    });
  }

  return updatedTask;
}

export async function getTasksByLocation(userId: string, type: string, id: string) {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ creatorId: userId }, { assigneeId: userId }],
      [type === 'home' ? 'homeId' : type === 'room' ? 'roomId' : 'itemId']: id,
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
          homeId: true,
          home: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      item: {
        select: {
          id: true,
          name: true,
          roomId: true,
          room: {
            select: {
              id: true,
              name: true,
              homeId: true,
              home: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return tasks as Task[];
}
