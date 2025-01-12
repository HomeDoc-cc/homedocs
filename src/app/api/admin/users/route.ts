import { Prisma, UserRole } from '@prisma/client';
import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import { logger } from '@/lib/logger';
import { adminMiddleware } from '@/middleware/admin';

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const middlewareResponse = await adminMiddleware(request);
    if (middlewareResponse.status !== 200) {
      return middlewareResponse;
    }

    const searchParams = new URL(request.url).searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'ALL';
    const status = searchParams.get('status') || 'ALL';

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Build where clause for search and filters
    const where: Prisma.UserWhereInput = {
      AND: [
        // Search condition
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
                { email: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
              ],
            }
          : {},
        // Role filter
        role !== 'ALL' ? { role: role as UserRole } : {},
        // Status filter
        status !== 'ALL' ? { isDisabled: status === 'DISABLED' } : {},
      ],
    };

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get paginated users
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isDisabled: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    // Get verification tokens for all users in a single query
    const verificationTokens = await prisma.verificationToken.findMany({
      where: {
        email: {
          in: users.map((user) => user.email).filter(Boolean) as string[],
        },
        expires: { gt: new Date() },
      },
      select: {
        email: true,
      },
    });

    // Create a set of emails with pending verification
    const emailsWithPendingVerification = new Set(verificationTokens.map((token) => token.email));

    // Map users with verification status
    const usersWithVerificationStatus = users.map((user) => ({
      ...user,
      hasVerificationPending:
        !user.emailVerified && user.email && emailsWithPendingVerification.has(user.email),
    }));

    return NextResponse.json({
      users: usersWithVerificationStatus,
      total,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);
    logger.error('Error fetching users in admin route', { error: errorObject });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin access
    const middlewareResponse = await adminMiddleware(request);
    if (middlewareResponse.status !== 200) {
      return middlewareResponse;
    }

    const { userId, role, isDisabled, action } = await request.json();

    if (!userId || (role === undefined && isDisabled === undefined && !action)) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Handle verification actions
    if (action) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, emailVerified: true },
      });

      if (!user?.email) {
        return new NextResponse('User has no email address', { status: 400 });
      }

      if (action === 'verify') {
        // Manually mark email as verified
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { emailVerified: new Date() },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isDisabled: true,
            createdAt: true,
            emailVerified: true,
          },
        });
        return NextResponse.json({ ...updatedUser, hasVerificationPending: false });
      }

      if (action === 'send-verification') {
        // Delete any existing verification tokens for this email
        await prisma.verificationToken.deleteMany({
          where: { email: user.email },
        });

        // Create new verification token
        const token = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        await prisma.verificationToken.create({
          data: {
            token,
            email: user.email,
            expires,
          },
        });

        // Send verification email
        await sendVerificationEmail(user.email, token);

        // Return updated user with verification status
        const updatedUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isDisabled: true,
            createdAt: true,
            emailVerified: true,
          },
        });

        // Since we just created a verification token, we know it's pending
        return NextResponse.json({ ...updatedUser, hasVerificationPending: true });
      }
    }

    // Handle regular user updates
    const updateData: { role?: 'USER' | 'ADMIN'; isDisabled?: boolean } = {};
    if (role !== undefined) updateData.role = role;
    if (isDisabled !== undefined) updateData.isDisabled = isDisabled;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isDisabled: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    // Check for verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        email: updatedUser.email!,
        expires: { gt: new Date() },
      },
    });

    return NextResponse.json({ ...updatedUser, hasVerificationPending: !!verificationToken });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorObject = error instanceof Error ? error : new Error(errorMessage);
    logger.error('Error updating user in admin route', { error: errorObject });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
