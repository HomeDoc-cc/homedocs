import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function checkAndRunMigrations() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping auto-migrations in development');
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
