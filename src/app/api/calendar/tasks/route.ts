import { TaskStatus } from '@prisma/client';
import ical, { ICalEventRepeatingFreq } from 'ical-generator';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get token from URL
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      logger.warn('Calendar tasks request without token');
      return new NextResponse('Token is required', { status: 401 });
    }

    // Find calendar token
    const calendarToken = await prisma.calendarToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            timezone: true,
          },
        },
      },
    });

    if (!calendarToken) {
      logger.warn('Calendar tasks request with invalid token', {
        token: token.substring(0, 8) + '...',
      });
      return new NextResponse('Invalid token', { status: 401 });
    }

    // Get user's timezone or default to UTC
    const userTimezone = calendarToken.user.timezone || 'UTC';

    // Get tasks for user
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ creatorId: calendarToken.userId }, { assigneeId: calendarToken.userId }],
        status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
      },
      include: {
        home: { select: { name: true } },
        room: { select: { name: true } },
        item: { select: { name: true } },
        creator: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
      },
    });

    // Create calendar
    const calendar = ical({
      name: 'HomeDocs Tasks',
      prodId: { company: 'HomeDocs', product: 'Tasks Calendar' },
      timezone: userTimezone,
    });

    // Add tasks to calendar
    tasks.forEach((task) => {
      if (!task.dueDate) return; // Skip tasks without due dates

      // Convert task due date to user's timezone
      const taskDate = new Date(task.dueDate);

      const location = [task.home?.name, task.room?.name].filter(Boolean).join(' - ');

      const description = [
        task.description,
        task.item?.name
          ? `Item: ${task.item.name}\n${request.nextUrl.origin}/items/${task.itemId}`
          : null,
        task.room?.name
          ? `Room: ${task.room.name}\n${request.nextUrl.origin}/rooms/${task.roomId}`
          : null,
        task.home?.name
          ? `Home: ${task.home.name}\n${request.nextUrl.origin}/homes/${task.homeId}`
          : null,
        task.assignee ? `Assigned to: ${task.assignee.name || task.assignee.email}` : null,
        task.creator ? `Created by: ${task.creator.name || task.creator.email}` : null,
        task.isRecurring
          ? `Recurring: Every ${task.interval} ${task.unit?.toLowerCase()}${task.interval === 1 ? '' : 's'}`
          : null,
      ]
        .filter(Boolean)
        .join('\n\n');

      const event = calendar.createEvent({
        id: task.id,
        start: taskDate,
        end: taskDate,
        allDay: true,
        summary: task.title + (task.isRecurring ? ' 🔄' : ''),
        description,
        location,
        // Skip status for now as it's causing type issues
        created: task.createdAt,
        lastModified: task.updatedAt,
        organizer: {
          name: task.creator?.name || task.creator?.email || 'HomeDocs',
          email: task.creator?.email || 'unknown@homedoc.cc',
        },
      });

      // Add recurrence rule for recurring tasks
      if (task.isRecurring && task.interval && task.unit) {
        const freqMap: Record<string, ICalEventRepeatingFreq> = {
          DAILY: ICalEventRepeatingFreq.DAILY,
          WEEKLY: ICalEventRepeatingFreq.WEEKLY,
          MONTHLY: ICalEventRepeatingFreq.MONTHLY,
          YEARLY: ICalEventRepeatingFreq.YEARLY,
        };

        event.repeating({
          freq: freqMap[task.unit],
          interval: task.interval,
        });
      }
    });

    logger.info('Calendar tasks fetched successfully', {
      userId: calendarToken.userId,
      count: tasks.length,
      userAgent: request.headers.get('user-agent'),
    });

    // Return iCal format with appropriate headers
    return new NextResponse(calendar.toString(), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);

    logger.error('Error processing calendar tasks request', {
      error: errorObject,
    });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
