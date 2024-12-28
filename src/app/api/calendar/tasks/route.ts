import ical, { ICalEventRepeatingFreq, ICalEventStatus } from 'ical-generator';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Get token from URL
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Verify token and get user
  const calendarToken = await prisma.calendarToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!calendarToken) {
    return new NextResponse('Invalid token', { status: 401 });
  }

  // Get tasks for the user
  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ creatorId: calendarToken.userId }, { assigneeId: calendarToken.userId }],
      NOT: {
        status: 'COMPLETED',
      },
    },
    include: {
      home: {
        select: {
          name: true,
        },
      },
      room: {
        select: {
          name: true,
        },
      },
      item: {
        select: {
          name: true,
        },
      },
    },
  });

  // Create calendar
  const calendar = ical({
    name: 'HomeDocs Tasks',
    timezone: 'UTC',
    url: request.url,
    ttl: 60,
    description: `Tasks for ${calendarToken.user.name || calendarToken.user.email}`,
  });

  // Add tasks to calendar
  tasks.forEach((task) => {
    let location = '';
    if (task.home) location = task.home.name;
    if (task.room) location += ` > ${task.room.name}`;
    if (task.item) location += ` > ${task.item.name}`;

    let description = task.description || '';
    if (location) {
      description += `\n\nLocation: ${location}`;
    }
    if (task.isRecurring) {
      description += `\n\nRecurring: Every ${task.interval} ${task.unit?.toLowerCase()}`;
    }

    calendar.createEvent({
      id: task.id,
      start: task.dueDate || new Date(),
      summary: task.title,
      description,
      status: task.status.toLowerCase() as ICalEventStatus,
      priority:
        task.priority === 'URGENT'
          ? 1
          : task.priority === 'HIGH'
            ? 3
            : task.priority === 'MEDIUM'
              ? 5
              : 7,
      repeating: task.isRecurring
        ? {
            freq: task.unit?.toLowerCase() as ICalEventRepeatingFreq,
            interval: task.interval || 1,
          }
        : undefined,
    });
  });

  // Generate ICS content
  const ics = calendar.toString();

  // Return as a live calendar feed
  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
