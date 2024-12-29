import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { logger, getRequestContext } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Starting data import', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const data = await request.json();

    // Start a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Process homes
      for (const home of data.homes) {
        // Skip if home already exists
        const existingHome = await tx.home.findUnique({
          where: { id: home.id },
        });
        if (existingHome) {
          logger.info('Skipping existing home during import', {
            userId: session.id,
            homeId: home.id,
          });
          continue;
        }

        // Create home
        const createdHome = await tx.home.create({
          data: {
            id: home.id,
            name: home.name,
            address: home.address,
            description: home.description,
            createdAt: new Date(home.createdAt),
            updatedAt: new Date(home.updatedAt),
            userId: session.id,
          },
        });

        logger.info('Created home during import', {
          userId: session.id,
          homeId: createdHome.id,
        });

        // Create rooms
        for (const room of home.rooms) {
          const createdRoom = await tx.room.create({
            data: {
              id: room.id,
              name: room.name,
              description: room.description,
              createdAt: new Date(room.createdAt),
              updatedAt: new Date(room.updatedAt),
              homeId: createdHome.id,
            },
          });

          logger.info('Created room during import', {
            userId: session.id,
            homeId: createdHome.id,
            roomId: createdRoom.id,
          });

          // Create room items
          for (const item of room.items) {
            const createdItem = await tx.item.create({
              data: {
                id: item.id,
                name: item.name,
                description: item.description,
                category: item.category,
                manufacturer: item.manufacturer,
                modelNumber: item.modelNumber,
                serialNumber: item.serialNumber,
                purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : null,
                warrantyUntil: item.warrantyUntil ? new Date(item.warrantyUntil) : null,
                manualUrl: item.manualUrl,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt),
                homeId: createdHome.id,
                roomId: createdRoom.id,
              },
            });

            logger.info('Created item during import', {
              userId: session.id,
              homeId: createdHome.id,
              roomId: createdRoom.id,
              itemId: createdItem.id,
            });
          }

          // Create room tasks
          for (const task of room.tasks) {
            const createdTask = await tx.task.create({
              data: {
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate ? new Date(task.dueDate) : null,
                isRecurring: task.isRecurring,
                interval: task.interval,
                unit: task.unit,
                lastCompleted: task.lastCompleted ? new Date(task.lastCompleted) : null,
                nextDueDate: task.nextDueDate ? new Date(task.nextDueDate) : null,
                createdAt: new Date(task.createdAt),
                updatedAt: new Date(task.updatedAt),
                creatorId: session.id,
                assigneeId: session.id,
                homeId: createdHome.id,
                roomId: createdRoom.id,
              },
            });

            logger.info('Created room task during import', {
              userId: session.id,
              homeId: createdHome.id,
              roomId: createdRoom.id,
              taskId: createdTask.id,
            });
          }

          // Create room paints
          for (const paint of room.paints) {
            const createdPaint = await tx.paint.create({
              data: {
                id: paint.id,
                name: paint.name,
                brand: paint.brand,
                color: paint.color,
                finish: paint.finish,
                code: paint.code,
                location: paint.location,
                notes: paint.notes,
                createdAt: new Date(paint.createdAt),
                updatedAt: new Date(paint.updatedAt),
                homeId: createdHome.id,
                roomId: createdRoom.id,
              },
            });

            logger.info('Created room paint during import', {
              userId: session.id,
              homeId: createdHome.id,
              roomId: createdRoom.id,
              paintId: createdPaint.id,
            });
          }

          // Create room floorings
          for (const flooring of room.floorings) {
            const createdFlooring = await tx.flooring.create({
              data: {
                id: flooring.id,
                name: flooring.name,
                type: flooring.type,
                material: flooring.material,
                brand: flooring.brand,
                color: flooring.color,
                pattern: flooring.pattern,
                notes: flooring.notes,
                createdAt: new Date(flooring.createdAt),
                updatedAt: new Date(flooring.updatedAt),
                homeId: createdHome.id,
                roomId: createdRoom.id,
              },
            });

            logger.info('Created room flooring during import', {
              userId: session.id,
              homeId: createdHome.id,
              roomId: createdRoom.id,
              flooringId: createdFlooring.id,
            });
          }
        }

        // Create home tasks
        for (const task of home.tasks) {
          const createdTask = await tx.task.create({
            data: {
              id: task.id,
              title: task.title,
              description: task.description,
              priority: task.priority,
              status: task.status,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              isRecurring: task.isRecurring,
              interval: task.interval,
              unit: task.unit,
              lastCompleted: task.lastCompleted ? new Date(task.lastCompleted) : null,
              nextDueDate: task.nextDueDate ? new Date(task.nextDueDate) : null,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt),
              creatorId: session.id,
              assigneeId: session.id,
              homeId: createdHome.id,
            },
          });

          logger.info('Created home task during import', {
            userId: session.id,
            homeId: createdHome.id,
            taskId: createdTask.id,
          });
        }

        // Create home paints
        for (const paint of home.paints) {
          const createdPaint = await tx.paint.create({
            data: {
              id: paint.id,
              name: paint.name,
              brand: paint.brand,
              color: paint.color,
              finish: paint.finish,
              code: paint.code,
              location: paint.location,
              notes: paint.notes,
              createdAt: new Date(paint.createdAt),
              updatedAt: new Date(paint.updatedAt),
              homeId: createdHome.id,
            },
          });

          logger.info('Created home paint during import', {
            userId: session.id,
            homeId: createdHome.id,
            paintId: createdPaint.id,
          });
        }

        // Create home floorings
        for (const flooring of home.floorings) {
          const createdFlooring = await tx.flooring.create({
            data: {
              id: flooring.id,
              name: flooring.name,
              type: flooring.type,
              material: flooring.material,
              brand: flooring.brand,
              color: flooring.color,
              pattern: flooring.pattern,
              notes: flooring.notes,
              createdAt: new Date(flooring.createdAt),
              updatedAt: new Date(flooring.updatedAt),
              homeId: createdHome.id,
            },
          });

          logger.info('Created home flooring during import', {
            userId: session.id,
            homeId: createdHome.id,
            flooringId: createdFlooring.id,
          });
        }
      }
    });

    logger.info('Data import completed successfully', {
      userId: session.id,
      homeCount: data.homes.length,
    });

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    logger.error('Import error', {
      ...getRequestContext(request),
      error: error as Error,
    });

    return new NextResponse(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to import data',
      }),
      { status: 500 }
    );
  }
} 