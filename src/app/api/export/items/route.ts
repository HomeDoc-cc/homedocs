import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getRequestContext, logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Starting items CSV export', {
      ...getRequestContext(request),
    });

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.warn('Unauthorized items export attempt', {
        ...getRequestContext(request),
      });
      return new NextResponse('Unauthorized', { status: 401 });
    }

    logger.info('Fetching items for export', {
      userId: session.user.id,
      ...getRequestContext(request),
    });

    // Get all items for homes the user has access to
    const items = await prisma.item.findMany({
      where: {
        home: {
          OR: [
            { userId: session.user.id },
            {
              shares: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          ],
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
      },
      orderBy: [{ homeId: 'asc' }, { roomId: 'asc' }, { name: 'asc' }],
    });

    logger.info('Items fetched successfully', {
      userId: session.user.id,
      itemCount: items.length,
      ...getRequestContext(request),
    });

    // Convert to CSV
    const headers = [
      'Name',
      'Description',
      'Category',
      'Manufacturer',
      'Model Number',
      'Serial Number',
      'Purchase Date',
      'Warranty Until',
      'Manual URL',
      'Home',
      'Room',
    ];

    const rows = items.map((item) => [
      item.name,
      item.description || '',
      item.category || '',
      item.manufacturer || '',
      item.modelNumber || '',
      item.serialNumber || '',
      item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '',
      item.warrantyUntil ? new Date(item.warrantyUntil).toLocaleDateString() : '',
      item.manualUrl || '',
      item.home.name,
      item.room.name,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    logger.info('CSV file generated successfully', {
      userId: session.user.id,
      itemCount: items.length,
      byteSize: Buffer.byteLength(csvContent, 'utf8'),
      ...getRequestContext(request),
    });

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="items.csv"',
      },
    });
  } catch (error: unknown) {
    const errorObject = error instanceof Error ? error : new Error('Unknown error occurred');
    logger.error('Error exporting items to CSV', {
      error: errorObject,
      ...getRequestContext(request),
    });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
