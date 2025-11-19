#!/bin/sh

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
npm run typeorm -- migration:run -d src/data-source.ts || echo "Migration failed, but continuing..."

echo "Starting application in development mode with hot reload..."
exec npm run start:dev