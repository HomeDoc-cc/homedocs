import { hash } from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Find the pending share
    const pendingShare = await prisma.pendingHomeShare.findUnique({
      where: { token },
      include: {
        home: true,
      },
    });

    if (!pendingShare) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    if (pendingShare.expiresAt < new Date()) {
      await prisma.pendingHomeShare.delete({
        where: { id: pendingShare.id },
      });
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    // If user is authenticated, verify email matches
    if (session?.user) {
      if (pendingShare.email !== session.user.email) {
        return NextResponse.json(
          { error: 'This invitation was sent to a different email address' },
          { status: 403 }
        );
      }

      // Create the home share for existing user
      const homeShare = await prisma.$transaction(async (tx) => {
        // Create the share
        const share = await tx.homeShare.create({
          data: {
            home: { connect: { id: pendingShare.homeId } },
            user: { connect: { id: session.user.id } },
            role: pendingShare.role,
          },
          include: {
            home: true,
          },
        });

        // Delete the pending share
        await tx.pendingHomeShare.delete({
          where: { id: pendingShare.id },
        });

        return share;
      });

      return NextResponse.json(homeShare);
    }

    // For new users, create account and share
    if (!body.name || !body.password) {
      return NextResponse.json({ error: 'Name and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: pendingShare.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 400 }
      );
    }

    const homeShare = await prisma.$transaction(async (tx) => {
      // Create the user
      const hashedPassword = await hash(body.password, 12);
      const user = await tx.user.create({
        data: {
          email: pendingShare.email,
          name: body.name,
          password: hashedPassword,
        },
      });

      // Create the share
      const share = await tx.homeShare.create({
        data: {
          home: { connect: { id: pendingShare.homeId } },
          user: { connect: { id: user.id } },
          role: pendingShare.role,
        },
        include: {
          home: true,
        },
      });

      // Delete the pending share
      await tx.pendingHomeShare.delete({
        where: { id: pendingShare.id },
      });

      return share;
    });

    return NextResponse.json(homeShare);
  } catch (error) {
    logger.error('Error accepting invite', {
      error: error instanceof Error ? error : undefined,
      token,
    });
    return NextResponse.json(
      { error: 'An error occurred while accepting the invitation' },
      { status: 500 }
    );
  }
}
