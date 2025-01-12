import { exec } from 'child_process';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promisify } from 'util';

import { logger } from '@/lib/logger';
import { adminMiddleware } from '@/middleware/admin';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const middlewareResponse = await adminMiddleware(request);
    if (middlewareResponse.status !== 200) {
      return middlewareResponse;
    }

    // Get database URL from environment and format it for pg_dump
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Remove schema parameter from URL as pg_dump doesn't support it
    const pgDumpUrl = databaseUrl.replace(/\?schema=.*$/, '');

    // Create backups directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    await fs.mkdir(backupDir, { recursive: true });

    // Generate backup filenames
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const tempFile = path.join(backupDir, `temp-${timestamp}.sql`);
    const finalFile = path.join(backupDir, `backup-${timestamp}.sql`);

    try {
      // Execute pg_dump to a temporary file first
      const { stderr } = await execAsync(`pg_dump "${pgDumpUrl}" > "${tempFile}"`);

      if (stderr) {
        logger.warn('Database backup warning', { warning: stderr });
      }

      // Check if the temp file exists and has content
      const stats = await fs.stat(tempFile);
      if (stats.size === 0) {
        throw new Error('Backup file is empty');
      }

      // Move the temp file to the final location
      await fs.rename(tempFile, finalFile);

      logger.info('Database backup created successfully', {
        path: finalFile,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Database backup created successfully',
        file: path.basename(finalFile),
      });
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempFile);
      } catch {
        // Ignore error if temp file doesn't exist
      }
      throw error;
    }
  } catch (error) {
    logger.error('Failed to backup database', {
      error: error as Error,
    });
    return NextResponse.json({ error: 'Failed to create database backup' }, { status: 500 });
  }
}
