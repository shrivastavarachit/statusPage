#!/bin/bash

# Tekion IT Status Page - Single Container Startup Script
# This script starts all services using supervisor

set -e

echo "🚀 Starting Tekion IT Status Page..."

# Create log directories
mkdir -p /var/log/supervisor /var/log/nginx

# Set proper permissions
chown -R nginx:nginx /var/log/nginx
chmod -R 755 /app

# Install admin dependencies if not present
if [ ! -d "/app/admin/node_modules" ]; then
    echo "📦 Installing admin dependencies..."
    cd /app/admin && npm install
    cd /app
fi

# Build Hugo site if public directory doesn't exist or is empty
if [ ! -d "/app/public" ] || [ -z "$(ls -A /app/public)" ]; then
    echo "🏗️ Building Hugo site..."
    hugo --destination public --minify
fi

# Copy nginx configuration
cp /app/docker/nginx.conf /etc/nginx/nginx.conf

# Start supervisor to manage all services
echo "🎯 Starting all services with supervisor..."
exec /usr/bin/supervisord -c /app/docker/supervisord.conf
