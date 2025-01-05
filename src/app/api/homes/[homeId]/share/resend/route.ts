import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { sendHomeShareInviteEmail } from '@/lib/email';
import { requireAuth } from '@/lib/session';

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ homeId: string }> }
) {
  try {
    const session = await requireAuth();
    const json = await request.json();
    const { email } = resendSchema.parse(json);

    // Find the pending share
    const pendingShare = await prisma.pendingHomeShare.findUnique({
      where: {
        homeId_email: {
          homeId: (await params).homeId,
          email,
        },
      },
      include: {
        home: {
          include: {
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!pendingShare) {
      return NextResponse.json(
        { error: 'No pending invitation found for this email' },
        { status: 404 }
      );
    }

    // Check if the user is the home owner
    if (pendingShare.home.owner.email !== session.email) {
      return NextResponse.json(
        { error: 'Only the home owner can resend invitations' },
        { status: 403 }
      );
    }

    // Update the expiration date
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    await prisma.pendingHomeShare.update({
      where: { id: pendingShare.id },
      data: { expiresAt },
    });

    // Resend the email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept/${pendingShare.token}`;
    const invitedBy = pendingShare.home.owner.name || pendingShare.home.owner.email || 'A user';

    await sendHomeShareInviteEmail(email, pendingShare.home.name, inviteUrl, invitedBy);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 