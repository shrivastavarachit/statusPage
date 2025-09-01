FROM node:18-alpine

# Install Hugo and Nginx
RUN apk add --no-cache hugo nginx

# Create app directory
WORKDIR /app

# Copy all files
COPY . .

# Create nginx directories
RUN mkdir -p /var/log/nginx /var/lib/nginx/tmp /run/nginx

# Build Hugo site initially
RUN hugo --destination public

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Make start script executable
RUN chmod +x docker/start.sh

# Expose ports
EXPOSE 80 3001

# Start services
CMD ["./docker/start.sh"]
