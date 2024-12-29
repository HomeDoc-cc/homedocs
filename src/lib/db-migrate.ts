import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

function isInBuildPhase() {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' || // Next.js build
    process.env.CI === 'true' // CI environment
  );
}

export async function checkAndRunMigrations() {
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  if (isInBuildPhase()) {
    console.log('Skipping auto-migrations during build phase');
    return;
  }

  try {
    console.log('Checking for pending migrations...');

    // Create a temporary client to check connection
    const prisma = new PrismaClient();

    try {
      // Test database connection
      await prisma.$connect();
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }

    // Run migrations
    console.log('Running migrations...');
    await execAsync('npx prisma migrate deploy');
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
