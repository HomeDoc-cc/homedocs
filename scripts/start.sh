#!/bin/sh

# Run Prisma migrations
echo "Running database migrations..."
npm run prisma:migrate

# Import color data if needed
echo "Checking paint color data..."
npx tsx scripts/importColorData.ts

# Start the Next.js application
echo "Starting Next.js..."
node server.js