#!/bin/bash
set -e

echo "==> Installing server dependencies..."
cd server
npm ci

echo "==> Generating Prisma client..."
npx prisma generate

echo "==> Running database migrations..."
npx prisma migrate deploy

echo "==> Build complete!"
