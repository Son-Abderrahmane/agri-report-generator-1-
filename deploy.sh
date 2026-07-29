#!/bin/bash
set -e

echo "🚀 Starting Deployment..."

# Navigate to app directory (assuming script is run from project root)
cd "$(dirname "$0")"

# Pull latest changes from git (Uncomment if using git on server)
# git pull origin main

# Docker setup
echo "🐳 Building and starting Docker containers..."
docker-compose up -d --build

# Backend tasks
echo "⚙️ Running backend setup..."
docker-compose exec app composer install --no-dev --optimize-autoloader
docker-compose exec app php artisan key:generate --force || true
docker-compose exec app php artisan migrate --force
docker-compose exec app php artisan optimize:clear
docker-compose exec app php artisan storage:link

echo "✅ Deployment Complete! App should be running on port 80."
