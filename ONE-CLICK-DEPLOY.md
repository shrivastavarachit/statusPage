# 🚀 Tekion IT Status Page - One-Click Deployment

## ⚡ Super Quick Start

### Option 1: Direct Deployment (Recommended)
```bash
# Clone and deploy in one command
git clone https://github.com/shrivastavarachit/statusPage.git && cd statusPage && ./deploy.sh
```

### Option 2: Step by Step
```bash
# 1. Clone repository
git clone https://github.com/shrivastavarachit/statusPage.git
cd statusPage

# 2. Run one-click deployment
./deploy.sh
```

### Option 3: Docker Compose Only
```bash
git clone https://github.com/shrivastavarachit/statusPage.git
cd statusPage
docker-compose up -d
```

## 📋 Prerequisites

- **Docker** installed and running
- **Docker Compose** (usually included with Docker)
- **Git** for cloning the repository
- **2GB RAM** minimum
- **Ports 80, 1313, 3001** available

## 🎯 What You Get

After running `./deploy.sh`, you'll have:

### ✅ Complete Status Page System
- **Status Page**: http://localhost (main access point)
- **Admin Dashboard**: http://localhost/admin
- **Direct Hugo**: http://localhost:1313 (development)
- **Direct Admin**: http://localhost:3001 (development)

### ✅ All Services in One Container
- **Hugo Server** - Live reloading status page
- **Node.js Admin** - Incident management dashboard
- **Nginx Proxy** - Professional web server with caching
- **Supervisor** - Process management and auto-restart

### ✅ Production Features
- Health checks and monitoring
- Automatic service restart
- Gzip compression
- Security headers
- Static asset caching
- Graceful fallbacks

## 🔧 Management Commands

```bash
# View service status
./deploy.sh --status

# View live logs
./deploy.sh --logs

# Stop all services
./deploy.sh --stop

# Update and restart
./deploy.sh --update

# Or use Docker Compose directly
docker-compose ps          # Check status
docker-compose logs -f     # View logs
docker-compose restart     # Restart services
docker-compose down        # Stop services
```

## 📊 Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Single Docker Container                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Nginx    │  │    Hugo     │  │    Node.js Admin    │  │
│  │   (Port 80) │  │ (Port 1313) │  │    (Port 3001)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                     │            │
│         └────────────────┼─────────────────────┘            │
│                          │                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Supervisor Process Manager                 │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🌐 Access Points

| URL | Purpose | Description |
|-----|---------|-------------|
| `http://localhost` | **Main Access** | Production-ready status page via Nginx |
| `http://localhost/admin` | **Admin Panel** | Incident management dashboard |
| `http://localhost/health` | **Health Check** | Service health monitoring |
| `http://localhost:1313` | **Hugo Direct** | Direct access to Hugo server |
| `http://localhost:3001` | **Admin Direct** | Direct access to admin server |

## 🎯 Quick Test

After deployment, test your status page:

```bash
# Check main status page
curl http://localhost

# Check admin dashboard
curl http://localhost/admin

# Check health endpoint
curl http://localhost/health

# Create a test incident
curl -X POST http://localhost:3001/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Incident",
    "severity": "notice",
    "affected": ["Corp VPN"],
    "description": "This is a test incident"
  }'
```

## 🔒 Security Features

- **Security Headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Gzip Compression**: Optimized content delivery
- **Static Asset Caching**: 1-year cache for static files
- **Health Monitoring**: Built-in health checks
- **Process Management**: Automatic service restart on failure

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts**:
```bash
# Check what's using the ports
sudo netstat -tlnp | grep -E ':(80|1313|3001)'

# Stop conflicting services
sudo systemctl stop apache2  # If Apache is running
sudo systemctl stop nginx    # If Nginx is running
```

2. **Docker not running**:
```bash
# Start Docker
sudo systemctl start docker

# Check Docker status
docker info
```

3. **Services not starting**:
```bash
# Check logs
./deploy.sh --logs

# Check container status
docker-compose ps

# Restart services
./deploy.sh --update
```

4. **Permission issues**:
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker

# Make scripts executable
chmod +x deploy.sh
```

## 📈 Performance & Scaling

### Single Container Benefits
- **Simplified Deployment**: One container, one command
- **Resource Efficiency**: Shared resources, lower overhead
- **Easy Management**: Single point of control
- **Fast Startup**: No network overhead between services

### When to Scale
Consider multiple containers when you need:
- High availability with load balancing
- Independent scaling of components
- Distributed deployment across servers
- Advanced monitoring and logging

## 🔄 Updates & Maintenance

### Regular Updates
```bash
# Update application
./deploy.sh --update

# Or manually
git pull
docker-compose build --no-cache
docker-compose up -d
```

### Backup Data
```bash
# Backup important data
docker cp tekion-status-page:/app/data ./backup-data
docker cp tekion-status-page:/app/content ./backup-content
```

### Monitor Health
```bash
# Check service health
./deploy.sh --status

# Monitor logs
./deploy.sh --logs
```

## 🎉 Success!

Your Tekion IT Status Page is now running with:

- ✅ **Professional status page** at http://localhost
- ✅ **Admin dashboard** at http://localhost/admin  
- ✅ **Real-time updates** between admin and status page
- ✅ **Production-ready** with Nginx, caching, and security
- ✅ **Self-healing** with supervisor and health checks
- ✅ **Easy management** with simple commands

## 📞 Support

- **GitHub Issues**: https://github.com/shrivastavarachit/statusPage/issues
- **Documentation**: Check other .md files in this repository
- **Logs**: Use `./deploy.sh --logs` for troubleshooting

---

**🚀 Welcome to professional IT status page management with one-click deployment!**
