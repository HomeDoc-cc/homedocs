import { PrismaClient } from '@prisma/client';

import { checkAndRunMigrations } from './db-migrate';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var isDbInitialized: boolean | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Initialize database connection
if (!global.isDbInitialized) {
  checkAndRunMigrations()
    .then(() => prisma.$connect())
    .then(() => {
      global.isDbInitialized = true;
      console.log('Database initialized successfully');
    })
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      throw error;
    });
}

export { prisma };
