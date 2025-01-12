import { exec } from 'child_process';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promisify } from 'util';

import { logger } from '@/lib/logger';
import { adminMiddleware } from '@/middleware/admin';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(file => file.startsWith('backup-') && file.endsWith('.sql'));
    
    return NextResponse.json({
      files: backupFiles.sort().reverse() // Most recent first
    });
  } catch (error) {
    logger.error('Failed to list backup files', {
      error: error as Error,
    });
    return NextResponse.json({ error: 'Failed to list backup files' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const middlewareResponse = await adminMiddleware(request);
    if (middlewareResponse.status !== 200) {
      return middlewareResponse;
    }

    const { filename } = await request.json();
    if (!filename) {
      return NextResponse.json({ error: 'No backup file specified' }, { status: 400 });
    }

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Validate backup file exists and is in the backups directory
    const backupDir = path.join(process.cwd(), 'backups');
    const backupFile = path.join(backupDir, filename);
    
    // Check if file exists and is within backups directory
    try {
      await fs.access(backupFile);
      const realPath = await fs.realpath(backupFile);
      if (!realPath.startsWith(await fs.realpath(backupDir))) {
        throw new Error('Invalid backup file path');
      }
    } catch {
      return NextResponse.json({ error: 'Backup file not found' }, { status: 404 });
    }

    // Execute psql to restore the backup
    const { stderr } = await execAsync(`psql "${databaseUrl}" < "${backupFile}"`);

    if (stderr) {
      logger.warn('Database restore warning', { warning: stderr });
    }

    logger.info('Database restored successfully', {
      file: filename,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Database restored successfully',
    });
  } catch (error) {
    logger.error('Failed to restore database', {
      error: error as Error,
    });
    return NextResponse.json({ error: 'Failed to restore database' }, { status: 500 });
  }
} 