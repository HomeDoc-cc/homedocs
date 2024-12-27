import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { deleteFlooring, updateFlooring } from '@/lib/flooring.utils';
import { requireAuth } from '@/lib/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ flooringId: string }> }
) {
  const session = await requireAuth();

  const body = await request.json();
  const schema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    brand: z.string().optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    style: z.string().optional(),
    price: z.number().optional(),
    purchaseDate: z.string().optional(),
    purchaseLocation: z.string().optional(),
    installDate: z.string().optional(),
    warranty: z.string().optional(),
    notes: z.string().optional(),
  });

  const validatedBody = schema.parse(body);
  const flooring = await updateFlooring((await params).flooringId, session.id, validatedBody);

  return NextResponse.json(flooring);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ flooringId: string }> }
) {
  const session = await requireAuth();

  await deleteFlooring((await params).flooringId, session.id);

  return new NextResponse(null, { status: 204 });
}
