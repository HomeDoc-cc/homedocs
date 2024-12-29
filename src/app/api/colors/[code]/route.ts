import { NextResponse } from 'next/server';

import { prisma } from '@/server/db';

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const cleanCode = (await params).code.trim().toUpperCase().replace(/\s+/g, ' ');

    const color = await prisma.color.findUnique({
      where: {
        code: cleanCode,
      },
    });

    if (!color) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 });
    }

    return NextResponse.json({
      code: color.code,
      name: color.name,
      brand: color.brand,
      hex: color.hex,
      rgb: {
        r: color.rgbR,
        g: color.rgbG,
        b: color.rgbB,
      },
    });
  } catch (error) {
    console.error('Error fetching color:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
