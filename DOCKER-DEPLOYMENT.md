# 🐳 Docker Deployment Guide - Tekion IT Status Page

Complete guide for deploying the Tekion IT Status Page using Docker and Docker Compose.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 10GB disk space
- Ports 1313 and 3001 available

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/shrivastavarachit/statusPage.git
cd statusPage
```

### 2. Start Services
```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access Applications
- **Status Page**: http://localhost:1313
- **Admin Dashboard**: http://localhost:3001

## 📁 Project Structure

```
statusPage/
├── docker-compose.yml          # Main orchestration file
├── Dockerfile                  # Multi-stage build configuration
├── docker/
│   ├── nginx.conf             # Nginx configuration
│   └── start.sh               # Container startup script
├── admin/                     # Admin dashboard
├── layouts/                   # Hugo templates
├── content/                   # Content and incidents
├── data/                      # Service configuration
└── static/                    # Static assets
```

## 🔧 Docker Compose Configuration

### Services Overview

```yaml
version: '3.8'

services:
  statuspage:
    build: .
    ports:
      - "1313:1313"    # Hugo server
      - "3001:3001"    # Admin dashboard
    volumes:
      - ./data:/app/data
      - ./content:/app/content
    environment:
      - HUGO_ENV=production
      - NODE_ENV=production
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - statuspage
    restart: unless-stopped
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HUGO_ENV` | Hugo environment | `production` |
| `NODE_ENV` | Node.js environment | `production` |
| `HUGO_BASEURL` | Base URL for the site | `http://localhost:1313` |
| `ADMIN_PORT` | Admin dashboard port | `3001` |

## 🏗️ Dockerfile Explanation

### Multi-Stage Build

```dockerfile
# Stage 1: Build Hugo site
FROM klakegg/hugo:ext-alpine AS hugo-build
WORKDIR /src
COPY . .
RUN hugo --minify

# Stage 2: Setup Node.js for admin
FROM node:18-alpine AS node-build
WORKDIR /app/admin
COPY admin/package*.json ./
RUN npm ci --only=production

# Stage 3: Runtime
FROM node:18-alpine
WORKDIR /app

# Install Hugo
RUN apk add --no-cache hugo

# Copy built site and admin
COPY --from=hugo-build /src/public ./public
COPY --from=node-build /app/admin/node_modules ./admin/node_modules
COPY . .

# Expose ports
EXPOSE 1313 3001

# Start script
CMD ["./docker/start.sh"]
```

## 🚀 Production Deployment

### 1. Environment Configuration

Create `.env` file:
```bash
# Production environment
HUGO_ENV=production
NODE_ENV=production
HUGO_BASEURL=https://status.yourdomain.com
ADMIN_PORT=3001

# SSL Configuration
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
```

### 2. SSL/TLS Setup

```bash
# Create SSL directory
mkdir -p ssl

# Option 1: Self-signed certificate (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=status.yourdomain.com"

# Option 2: Let's Encrypt (production)
# Use certbot to generate certificates and copy to ssl/ directory
```

### 3. Production Docker Compose

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  statuspage:
    build: .
    environment:
      - HUGO_ENV=production
      - NODE_ENV=production
      - HUGO_BASEURL=https://status.yourdomain.com
    volumes:
      - ./data:/app/data
      - ./content:/app/content
      - statuspage_logs:/app/logs
    restart: unless-stopped
    networks:
      - statuspage_network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.prod.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - statuspage
    restart: unless-stopped
    networks:
      - statuspage_network

volumes:
  statuspage_logs:
  nginx_logs:

networks:
  statuspage_network:
    driver: bridge
```

### 4. Production Nginx Configuration

Create `docker/nginx.prod.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream statuspage {
        server statuspage:1313;
    }
    
    upstream admin {
        server statuspage:3001;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name status.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name status.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # Status page
        location / {
            proxy_pass http://statuspage;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Admin dashboard (restrict access)
        location /admin {
            # Restrict to internal networks
            allow 192.168.0.0/16;
            allow 10.0.0.0/8;
            deny all;

            proxy_pass http://admin;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 5. Deploy to Production

```bash
# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 Management Commands

### Basic Operations

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f [service_name]

# Check status
docker-compose ps
```

### Maintenance Commands

```bash
# Update and rebuild
git pull
docker-compose build --no-cache
docker-compose up -d

# Backup data
docker run --rm -v statuspage_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data

# Restore data
docker run --rm -v statuspage_data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /

# Clean up unused images
docker system prune -a
```

### Scaling Services

```bash
# Scale specific service
docker-compose up -d --scale statuspage=2

# Load balancer configuration needed for multiple instances
```

## 📊 Monitoring & Logging

### Health Checks

Add health checks to `docker-compose.yml`:
```yaml
services:
  statuspage:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:1313"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Log Management

```bash
# View real-time logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f statuspage

# Export logs
docker-compose logs --no-color > statuspage.log

# Configure log rotation in docker-compose.yml
services:
  statuspage:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Monitoring with Prometheus

Create `docker-compose.monitoring.yml`:
```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

## 🔒 Security Best Practices

### 1. Container Security

```dockerfile
# Use non-root user
RUN addgroup -g 1001 -S statuspage && \
    adduser -S statuspage -u 1001 -G statuspage

USER statuspage
```

### 2. Network Security

```yaml
# Isolate networks
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
```

### 3. Secrets Management

```yaml
# Use Docker secrets
secrets:
  ssl_cert:
    file: ./ssl/cert.pem
  ssl_key:
    file: ./ssl/key.pem

services:
  nginx:
    secrets:
      - ssl_cert
      - ssl_key
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts:**
```bash
# Check port usage
netstat -tlnp | grep -E ':(1313|3001|80|443)'

# Change ports in docker-compose.yml
ports:
  - "8080:1313"  # Use different host port
```

2. **Permission issues:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod -R 755 .
```

3. **Build failures:**
```bash
# Clean build
docker-compose build --no-cache --pull

# Check build logs
docker-compose build 2>&1 | tee build.log
```

4. **Service not accessible:**
```bash
# Check container status
docker-compose ps

# Check container logs
docker-compose logs statuspage

# Test internal connectivity
docker-compose exec statuspage curl http://localhost:1313
```

### Debug Mode

```bash
# Run with debug output
docker-compose --verbose up

# Access container shell
docker-compose exec statuspage sh

# Check container processes
docker-compose exec statuspage ps aux
```

## 📈 Performance Optimization

### 1. Resource Limits

```yaml
services:
  statuspage:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 2. Caching

```yaml
# Add Redis for caching
services:
  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

### 3. CDN Integration

Configure Nginx for static asset caching:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Status Page

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /opt/statuspage
          git pull
          docker-compose build --no-cache
          docker-compose up -d
```

---

**🎉 Your Tekion IT Status Page is now running in Docker!**

- Status Page: http://localhost:1313
- Admin Dashboard: http://localhost:3001
- Nginx Proxy: http://localhost (if configured)
