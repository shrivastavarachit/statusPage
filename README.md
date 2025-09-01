# Tekion IT Status Page

A modern, professional status page built with Hugo and cState theme, featuring a custom admin dashboard for real-time incident management.

## 🌟 Features

### Status Page
- **Clean, Professional Design** - Atlassian-inspired landing page
- **Real-time Status Updates** - Dynamic service status display
- **Collapsible Service Status** - Organized service monitoring
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Custom Branding** - Tekion-themed colors and styling
- **Incident History** - Complete incident tracking and resolution

### Admin Dashboard
- **Real-time Incident Management** - Create, update, and resolve incidents
- **Service Status Control** - Manage individual service statuses
- **Live Updates** - Changes reflect immediately on status page
- **User-friendly Interface** - Simple, intuitive admin panel
- **Multiple Severity Levels** - Notice, Disrupted, Down classifications

### Services Monitored
- Bangalore ISP Tata Comms
- Bangalore ISP Tata Tele
- Bangalore ISP Airtel
- Corp VPN
- API Services
- Media Proxy

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Status Page   │    │ Admin Dashboard │    │   Hugo Server   │
│  (Port 1313)    │◄───┤   (Port 3001)   │◄───┤   Static Site   │
│                 │    │                 │    │   Generator     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │   PHP Backend   │    │   Data Files    │
│   (HTML/CSS/JS) │    │   (API Layer)   │    │  (JSON/Markdown)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- **Docker & Docker Compose** (Recommended)
- **OR Manual Setup:**
  - Hugo Extended (v0.148.2+)
  - PHP 8.0+
  - Node.js 16+
  - Web Server (Nginx/Apache)

## 🚀 One-Click Deployment (Recommended)

### ⚡ Super Quick Start
```bash
# Clone and deploy in one command
git clone https://github.com/shrivastavarachit/statusPage.git && cd statusPage && ./deploy.sh
```

### 🎯 What You Get
- **Status Page**: http://localhost (main access point)
- **Admin Dashboard**: http://localhost/admin
- **All services in one container** with Nginx, Hugo, and Node.js
- **Production-ready** with health checks and auto-restart

**[→ Complete One-Click Guide](ONE-CLICK-DEPLOY.md)**

## 🐳 Alternative: Docker Compose Only

### 1. Clone Repository
```bash
git clone https://github.com/shrivastavarachit/statusPage.git
cd statusPage
```

### 2. Start with Docker Compose
```bash
docker-compose up -d
```

### 3. Access Applications
- **Status Page**: http://localhost
- **Admin Dashboard**: http://localhost/admin
- **Direct Hugo**: http://localhost:1313
- **Direct Admin**: http://localhost:3001

## 📖 Manual Installation Guide

### Step 1: System Requirements
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl wget git

# CentOS/RHEL
sudo yum update -y
sudo yum install -y curl wget git
```

### Step 2: Install Hugo Extended
```bash
# Download Hugo Extended
wget https://github.com/gohugoio/hugo/releases/download/v0.148.2/hugo_extended_0.148.2_linux-amd64.tar.gz

# Extract and install
tar -xzf hugo_extended_0.148.2_linux-amd64.tar.gz
sudo mv hugo /usr/local/bin/
hugo version
```

### Step 3: Install PHP
```bash
# Ubuntu/Debian
sudo apt install -y php8.1 php8.1-cli php8.1-json php8.1-mbstring

# CentOS/RHEL
sudo yum install -y php php-cli php-json php-mbstring
```

### Step 4: Install Node.js
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 5: Clone and Setup Project
```bash
# Clone repository
git clone https://github.com/shrivastavarachit/statusPage.git
cd statusPage

# Install admin dependencies
cd admin
npm install
cd ..
```

### Step 6: Start Services
```bash
# Terminal 1: Start Hugo server
hugo server --bind 0.0.0.0 --port 1313

# Terminal 2: Start Admin server
cd admin
node server.js
```

## 🐳 Docker Deployment

### Dockerfile Overview
The project includes a multi-stage Dockerfile that:
1. **Build Stage**: Installs Hugo and builds the static site
2. **Runtime Stage**: Sets up Nginx with PHP-FPM for serving

### Docker Compose Services
- **statuspage**: Main application container
- **nginx**: Reverse proxy and static file serving
- **volumes**: Persistent data storage

### Environment Variables
```yaml
# docker-compose.yml
environment:
  - HUGO_ENV=production
  - HUGO_BASEURL=http://your-domain.com
```

## 📚 Documentation

### 🚀 Quick Start Guides
- **[One-Click Deployment](ONE-CLICK-DEPLOY.md)** - ⚡ Fastest way to get started
- **[Admin Guide](ADMIN-GUIDE.md)** - Managing incidents and services
- **[Deployment Summary](DEPLOYMENT-SUMMARY.md)** - Quick reference for all options

### 🏗️ Advanced Deployment
- **[VM Deployment Guide](VM-DEPLOYMENT-GUIDE.md)** - Complete step-by-step VM setup
- **[Docker Deployment Guide](DOCKER-DEPLOYMENT.md)** - Advanced Docker configurations

### 🔗 Quick Links
- **[One-Click Setup](ONE-CLICK-DEPLOY.md#super-quick-start)** - Single command deployment
- **[VM Docker Setup](VM-DEPLOYMENT-GUIDE.md#option-1-docker-deployment-recommended)** - Docker on VM
- **[Manual VM Setup](VM-DEPLOYMENT-GUIDE.md#option-2-manual-vm-setup)** - Traditional installation
- **[Admin Dashboard Usage](ADMIN-GUIDE.md#incident-management)** - Creating and managing incidents

## 🖥️ VM Deployment (Production Ready)

For production deployment on a Virtual Machine, follow our comprehensive guides:

### Option 1: Docker on VM (Recommended)
```bash
# Quick setup on Ubuntu 20.04+
git clone https://github.com/shrivastavarachit/statusPage.git
cd statusPage

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh

# Deploy
docker-compose up -d
```
**[→ Full VM Docker Guide](VM-DEPLOYMENT-GUIDE.md#option-1-docker-deployment-recommended)**

### Option 2: Manual Installation
```bash
# Install dependencies
sudo apt update
sudo apt install -y hugo php8.1 nodejs npm nginx

# Clone and setup
git clone https://github.com/shrivastavarachit/statusPage.git
cd statusPage && cd admin && npm install && cd ..

# Start services
hugo server --bind 0.0.0.0 --port 1313 &
cd admin && node server.js &
```
**[→ Full Manual Setup Guide](VM-DEPLOYMENT-GUIDE.md#option-2-manual-vm-setup)**

## 🔧 Configuration

### Hugo Configuration (`config.yml`)
```yaml
baseURL: "http://your-domain.com"
languageCode: "en"
title: "Tekion IT Status"
theme: "cstate"

params:
  title: "Tekion IT Status"
  description: "Tekion IT infrastructure status page"
  logo: "/tekionlogo.png"

  # Custom settings
  enableCustomCSS: true
  customCSS: "/custom.css"
```

### Service Configuration (`data/services.json`)
```json
{
  "services": [
    {
      "name": "Bangalore ISP Tata Comms",
      "status": "operational",
      "description": "Primary ISP connection"
    },
    {
      "name": "Corp VPN",
      "status": "operational",
      "description": "Corporate VPN access"
    }
  ]
}
```

## 👨‍💼 Admin Dashboard Usage

### Creating Incidents
1. **Access**: http://localhost:3001 (or your-domain.com/admin)
2. **Fill Form**: Title, description, affected services, severity
3. **Submit**: Changes appear immediately on status page

### Severity Levels
- **Notice** 🔵: Minor issues, maintenance notifications
- **Disrupted** 🟡: Partial service degradation
- **Down** 🔴: Complete service outage

**[→ Complete Admin Guide](ADMIN-GUIDE.md)**

## 🔒 Security Considerations

### 1. Firewall Configuration
```bash
# Ubuntu UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 1313  # Status page
sudo ufw allow 3001  # Admin (consider restricting)
sudo ufw enable
```

### 2. Admin Access Restriction
```nginx
# Nginx configuration for admin access
location /admin {
    allow 192.168.1.0/24;  # Internal network only
    deny all;
    proxy_pass http://localhost:3001;
}
```

### 3. SSL/TLS Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check service status
curl -f http://localhost:1313 || echo "Status page down"
curl -f http://localhost:3001 || echo "Admin down"

# Check disk space
df -h

# Check logs
sudo journalctl -u statuspage-hugo -f
sudo journalctl -u statuspage-admin -f
```

### Backup Strategy
```bash
# Backup script
#!/bin/bash
BACKUP_DIR="/backup/statuspage/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup data files
cp -r ./data $BACKUP_DIR/
cp -r ./content $BACKUP_DIR/
cp ./config.yml $BACKUP_DIR/

# Compress backup
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR
```

## 🚨 Troubleshooting

### Common Issues

1. **Hugo server not starting**
```bash
# Check Hugo installation
hugo version

# Check port availability
sudo netstat -tlnp | grep 1313

# Check permissions
ls -la ./
```

2. **Admin dashboard not accessible**
```bash
# Check Node.js process
ps aux | grep node

# Check admin logs
cd admin && npm run logs
```

3. **Status not updating**
```bash
# Check data file permissions
ls -la data/services.json

# Restart Hugo server
hugo server --bind 0.0.0.0 --port 1313
```

### Log Locations
- **Hugo logs**: Console output or systemd journal
- **Admin logs**: Console output or systemd journal
- **System logs**: `/var/log/syslog`

## 📞 Support

For issues and questions:
- **GitHub Issues**: https://github.com/shrivastavarachit/statusPage/issues
- **Documentation**: Check the guides in this repository
- **Logs**: Always check service logs first

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for Tekion IT Infrastructure Team**

## License

MIT © Mantas Vilčinskas
