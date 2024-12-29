import { PrismaClient } from '@prisma/client';

import { checkAndRunMigrations } from './db-migrate';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Initialize database and run migrations if needed
export async function initializeDatabase() {
  try {
    await checkAndRunMigrations();
    await prisma.$connect();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}
