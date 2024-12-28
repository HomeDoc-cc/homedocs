import { NextResponse } from 'next/server';

import { prisma } from '@/server/db';

export async function GET() {
  try {
    // Get distinct brands from the Color table
    const brands = await prisma.color.findMany({
      distinct: ['brand'],
      select: {
        brand: true,
      },
      orderBy: {
        brand: 'asc',
      },
    });

    return NextResponse.json(brands.map((b) => b.brand));
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
