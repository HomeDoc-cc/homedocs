#!/bin/sh

# Run Prisma migrations
echo "Running database migrations..."
npm run prisma:migrate

# Start the Next.js application
echo "Starting Next.js..."
npm run start 