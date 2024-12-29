import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { logger, getRequestContext } from '@/lib/logger';
import { requireAuth } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    logger.info('Starting data export', {
      ...getRequestContext(request),
      userId: session.id,
    });

    const userData = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        ownedHomes: {
          include: {
            rooms: {
              include: {
                items: {
                  include: {
                    tasks: true,
                  },
                },
                tasks: true,
                paints: true,
                floorings: true,
              },
            },
            items: {
              include: {
                tasks: true,
              },
            },
            tasks: true,
            paints: true,
            floorings: true,
            shares: {
              include: {
                user: {
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
        sharedHomes: {
          include: {
            home: {
              include: {
                rooms: {
                  include: {
                    items: {
                      include: {
                        tasks: true,
                      },
                    },
                    tasks: true,
                    paints: true,
                    floorings: true,
                  },
                },
                items: {
                  include: {
                    tasks: true,
                  },
                },
                tasks: true,
                paints: true,
                floorings: true,
              },
            },
          },
        },
      },
    });

    if (!userData) {
      logger.error('User not found during export', {
        ...getRequestContext(request),
        userId: session.id,
      });
      return new NextResponse('User not found', { status: 404 });
    }

    // Format the data for export
    const exportData = {
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt,
      },
      homes: [
        // Owned homes
        ...userData.ownedHomes.map((home) => ({
          id: home.id,
          name: home.name,
          address: home.address,
          description: home.description,
          createdAt: home.createdAt,
          updatedAt: home.updatedAt,
          isOwner: true,
          shares: home.shares.map((share) => ({
            userId: share.user.id,
            userName: share.user.name,
            userEmail: share.user.email,
            role: share.role,
          })),
          rooms: home.rooms.map((room) => ({
            id: room.id,
            name: room.name,
            description: room.description,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
            items: room.items.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              category: item.category,
              manufacturer: item.manufacturer,
              modelNumber: item.modelNumber,
              serialNumber: item.serialNumber,
              purchaseDate: item.purchaseDate,
              warrantyUntil: item.warrantyUntil,
              manualUrl: item.manualUrl,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              tasks: item.tasks,
            })),
            tasks: room.tasks,
            paints: room.paints,
            floorings: room.floorings,
          })),
          items: home.items.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            manufacturer: item.manufacturer,
            modelNumber: item.modelNumber,
            serialNumber: item.serialNumber,
            purchaseDate: item.purchaseDate,
            warrantyUntil: item.warrantyUntil,
            manualUrl: item.manualUrl,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            tasks: item.tasks,
          })),
          tasks: home.tasks,
          paints: home.paints,
          floorings: home.floorings,
        })),
        // Shared homes
        ...userData.sharedHomes.map((share) => ({
          id: share.home.id,
          name: share.home.name,
          address: share.home.address,
          description: share.home.description,
          createdAt: share.home.createdAt,
          updatedAt: share.home.updatedAt,
          isOwner: false,
          rooms: share.home.rooms.map((room) => ({
            id: room.id,
            name: room.name,
            description: room.description,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
            items: room.items.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              category: item.category,
              manufacturer: item.manufacturer,
              modelNumber: item.modelNumber,
              serialNumber: item.serialNumber,
              purchaseDate: item.purchaseDate,
              warrantyUntil: item.warrantyUntil,
              manualUrl: item.manualUrl,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              tasks: item.tasks,
            })),
            tasks: room.tasks,
            paints: room.paints,
            floorings: room.floorings,
          })),
          items: share.home.items.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            manufacturer: item.manufacturer,
            modelNumber: item.modelNumber,
            serialNumber: item.serialNumber,
            purchaseDate: item.purchaseDate,
            warrantyUntil: item.warrantyUntil,
            manualUrl: item.manualUrl,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            tasks: item.tasks,
          })),
          tasks: share.home.tasks,
          paints: share.home.paints,
          floorings: share.home.floorings,
        })),
      ],
    };

    logger.info('Data export completed successfully', {
      userId: session.id,
      ownedHomeCount: userData.ownedHomes.length,
      sharedHomeCount: userData.sharedHomes.length,
    });

    return NextResponse.json(exportData);
  } catch (error) {
    logger.error('Failed to export data', {
      ...getRequestContext(request),
      error: error as Error,
    });

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 