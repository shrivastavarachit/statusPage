#!/bin/sh

echo "Starting Tekion IT Status Page..."

# Start admin server in background
cd /app/admin
node server.js &

# Start nginx in foreground
nginx -g 'daemon off;'
