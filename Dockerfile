# Tekion IT Status Page - Single Container Dockerfile
# This creates a complete, self-contained status page with admin dashboard

FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    bash \
    wget \
    tar \
    && rm -rf /var/cache/apk/*

# Install Hugo Extended
RUN wget https://github.com/gohugoio/hugo/releases/download/v0.148.2/hugo_extended_0.148.2_Linux-64bit.tar.gz \
    && tar -xzf hugo_extended_0.148.2_Linux-64bit.tar.gz \
    && mv hugo /usr/local/bin/ \
    && rm hugo_extended_0.148.2_Linux-64bit.tar.gz \
    && hugo version

# Create app directory and set working directory
WORKDIR /app

# Copy package.json first for better Docker layer caching
COPY admin/package*.json ./admin/
RUN cd admin && npm ci --only=production

# Copy all application files
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p /var/log/nginx /var/lib/nginx/tmp /run/nginx /var/log/supervisor \
    && chown -R nginx:nginx /var/log/nginx /var/lib/nginx \
    && chmod -R 755 /app \
    && chmod +x /app/docker/start.sh

# Build Hugo site initially
RUN hugo --destination public --minify

# Expose ports (80 for nginx proxy, 1313 for Hugo, 3001 for admin)
EXPOSE 80 1313 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:1313 && curl -f http://localhost:3001 || exit 1

# Start all services using supervisor
CMD ["/app/docker/start.sh"]
CMD ["./docker/start.sh"]
