import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// Environment variables
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'cloud'; // 'local' or 'cloud'
const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || './uploads';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// S3 configuration
const S3_BUCKET = process.env.S3_BUCKET || '';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || '';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || '';
const S3_ENDPOINT = process.env.S3_ENDPOINT || undefined;
const S3_FORCE_PATH_STYLE = process.env.S3_FORCE_PATH_STYLE === 'true';
const S3_URL_EXPIRATION = parseInt(process.env.S3_URL_EXPIRATION || '3600', 10);

interface StorageProvider {
  uploadFile: (file: Buffer, filename: string, mimetype: string, userId: string) => Promise<string>;
  deleteFile: (key: string, userId: string) => Promise<void>;
  getUrl: (key: string, userId: string, homeId?: string) => Promise<string>;
}

class LocalStorageProvider implements StorageProvider {
  private storagePath: string;

  constructor(storagePath: string) {
    this.storagePath = storagePath;
  }

  async uploadFile(
    file: Buffer,
    filename: string,
    mimetype: string,
    userId: string
  ): Promise<string> {
    // Create user-specific storage directory
    const userPath = path.join(this.storagePath, userId);
    await fs.mkdir(userPath, { recursive: true });

    // Generate unique filename
    const ext = path.extname(filename);
    const hash = crypto.randomBytes(8).toString('hex');
    const safeFilename = `${hash}${ext}`;
    const filePath = path.join(userPath, safeFilename);

    // Save file
    await fs.writeFile(filePath, file);

    // Return storage key (relative path)
    return `${userId}/${safeFilename}`;
  }

  async deleteFile(key: string, userId: string): Promise<void> {
    // Verify the key belongs to the user
    if (!key.startsWith(`${userId}/`)) {
      throw new Error('Unauthorized access to file');
    }

    const filePath = path.join(this.storagePath, key);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async getUrl(key: string, userId: string, homeId?: string): Promise<string> {
    // If homeId is provided, skip user verification (will be handled by the API layer)
    if (!homeId && !key.startsWith(`${userId}/`)) {
      throw new Error('Unauthorized access to file');
    }

    return `${BASE_URL}/uploads/${key}`;
  }
}

class CloudStorageProvider implements StorageProvider {
  private s3Client: S3Client;
  private bucket: string;
  private urlExpiration: number;

  constructor() {
    if (!S3_BUCKET || !S3_ACCESS_KEY || !S3_SECRET_KEY) {
      throw new Error('Missing required S3 configuration');
    }

    const clientConfig: S3ClientConfig = {
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
      forcePathStyle: S3_FORCE_PATH_STYLE,
    };

    if (S3_ENDPOINT) {
      clientConfig.endpoint = S3_ENDPOINT;
      if (!S3_REGION) {
        clientConfig.region = 'us-east-1';
        clientConfig.forcePathStyle = true;
      }
    }

    this.s3Client = new S3Client(clientConfig);
    this.bucket = S3_BUCKET;
    this.urlExpiration = S3_URL_EXPIRATION;
  }

  private async getSignedUrl(key: string, contentType?: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: `uploads/${key}`,
      ResponseContentType: contentType,
      ResponseCacheControl: 'public, max-age=31536000, immutable', // Cache for 1 year
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: this.urlExpiration });
  }

  async uploadFile(
    file: Buffer,
    filename: string,
    mimetype: string,
    userId: string
  ): Promise<string> {
    // Generate unique filename with user-specific path
    const ext = path.extname(filename);
    const hash = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const key = `${userId}/${timestamp}-${hash}${ext}`;

    // Upload to S3 with improved caching and compression settings
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: `uploads/${key}`,
      Body: file,
      ContentType: mimetype,
      CacheControl: 'public, max-age=31536000, immutable', // Cache for 1 year
      ContentEncoding: mimetype === 'image/webp' ? 'br' : undefined, // Use Brotli compression for WebP
      Metadata: {
        'original-name': filename,
        'upload-date': new Date().toISOString(),
        'user-id': userId,
      },
    });

    await this.s3Client.send(command);

    return key;
  }

  async deleteFile(key: string, userId: string): Promise<void> {
    // Verify the key belongs to the user
    if (!key.startsWith(`${userId}/`)) {
      throw new Error('Unauthorized access to file');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: `uploads/${key}`,
    });

    try {
      await this.s3Client.send(command);

      // Also try to delete the thumbnail if it exists
      if (!key.endsWith('-thumb.webp')) {
        const thumbKey = key.replace(/\.[^/.]+$/, '-thumb.webp');
        const thumbCommand = new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: `uploads/${thumbKey}`,
        });
        await this.s3Client.send(thumbCommand).catch(() => {
          // Ignore errors if thumbnail doesn't exist
        });
      }
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as { name: string }).name !== 'NoSuchKey') {
        throw error;
      }
    }
  }

  async getUrl(key: string, userId: string, homeId?: string): Promise<string> {
    // If homeId is provided, skip user verification (will be handled by the API layer)
    if (!homeId && !key.startsWith(`${userId}/`)) {
      throw new Error('Unauthorized access to file');
    }

    // Determine content type based on extension
    const ext = path.extname(key).toLowerCase();
    const contentType =
      {
        '.webp': 'image/webp',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
      }[ext] || 'application/octet-stream';

    return this.getSignedUrl(key, contentType);
  }
}

export function getStorageProvider(): StorageProvider {
  if (STORAGE_TYPE === 'local') {
    return new LocalStorageProvider(LOCAL_STORAGE_PATH);
  }
  return new CloudStorageProvider();
}
