# 🖥️ VM Deployment Guide - Tekion IT Status Page

Complete step-by-step guide for deploying the Tekion IT Status Page on a Virtual Machine.

## 📋 VM Requirements

### Minimum Specifications
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 10GB minimum (20GB recommended)
- **CPU**: 2 cores minimum
- **Network**: Public IP with ports 80, 443, 1313, 3001 accessible

### Recommended Specifications
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **CPU**: 2-4 cores
- **Network**: Static IP with domain name

## 🚀 Option 1: Docker Deployment (Recommended)

### Step 1: Prepare VM Environment

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git vim htop

# Create application user
sudo useradd -m -s /bin/bash statuspage
sudo usermod -aG sudo statuspage

# Switch to application user
sudo su - statuspage
```

### Step 2: Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker statuspage
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### Step 3: Deploy Application

```bash
# Create application directory
mkdir -p /home/statuspage/app
cd /home/statuspage/app

# Clone repository
git clone https://github.com/shrivastavarachit/statusPage.git .

# Review configuration
cat docker-compose.yml

# Start services
docker-compose up -d

# Check service status
docker-compose ps
docker-compose logs
```

### Step 4: Configure Firewall

```bash
# Ubuntu UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 1313
sudo ufw allow 3001
sudo ufw --force enable

# Check firewall status
sudo ufw status
```

### Step 5: Verify Deployment

```bash
# Check if services are running
curl -f http://localhost:1313 && echo "Status page OK"
curl -f http://localhost:3001 && echo "Admin dashboard OK"

# Check from external IP
curl -f http://YOUR_VM_IP:1313
curl -f http://YOUR_VM_IP:3001
```

## 🔧 Option 2: Manual Installation

### Step 1: System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install build essentials
sudo apt install -y build-essential curl wget git vim

# Create application directory
sudo mkdir -p /opt/statuspage
sudo chown $USER:$USER /opt/statuspage
cd /opt/statuspage
```

### Step 2: Install Hugo Extended

```bash
# Download Hugo Extended (latest version)
HUGO_VERSION="0.148.2"
wget https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz

# Extract and install
tar -xzf hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz
sudo mv hugo /usr/local/bin/
rm hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz

# Verify installation
hugo version
```

### Step 3: Install PHP 8.1

```bash
# Add PHP repository
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install PHP and extensions
sudo apt install -y php8.1 php8.1-cli php8.1-fpm php8.1-json php8.1-mbstring php8.1-curl

# Verify installation
php --version
```

### Step 4: Install Node.js 18

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 5: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 6: Clone and Setup Project

```bash
# Clone repository
cd /opt/statuspage
git clone https://github.com/shrivastavarachit/statusPage.git .

# Install admin dependencies
cd admin
npm install
cd ..

# Set proper permissions
sudo chown -R www-data:www-data /opt/statuspage
sudo chmod -R 755 /opt/statuspage
```

### Step 7: Create Systemd Services

**Create Hugo Service:**
```bash
sudo tee /etc/systemd/system/statuspage-hugo.service > /dev/null <<EOF
[Unit]
Description=Tekion Status Page Hugo Server
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/statuspage
ExecStart=/usr/local/bin/hugo server --bind 0.0.0.0 --port 1313 --baseURL http://YOUR_DOMAIN_OR_IP
Restart=always
RestartSec=10
Environment=HUGO_ENV=production

[Install]
WantedBy=multi-user.target
EOF
```

**Create Admin Service:**
```bash
sudo tee /etc/systemd/system/statuspage-admin.service > /dev/null <<EOF
[Unit]
Description=Tekion Status Page Admin Server
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/statuspage/admin
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOF
```

### Step 8: Configure Nginx

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/statuspage > /dev/null <<EOF
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Status Page (Hugo)
    location / {
        proxy_pass http://localhost:1313;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Admin Dashboard
    location /admin {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Optional: Restrict admin access to internal IPs
        # allow 192.168.1.0/24;
        # allow 10.0.0.0/8;
        # deny all;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/statuspage /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 9: Start Services

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable and start services
sudo systemctl enable statuspage-hugo statuspage-admin
sudo systemctl start statuspage-hugo statuspage-admin

# Check service status
sudo systemctl status statuspage-hugo
sudo systemctl status statuspage-admin
```

### Step 10: Verify Installation

```bash
# Check local services
curl -f http://localhost:1313 && echo "Hugo server OK"
curl -f http://localhost:3001 && echo "Admin server OK"

# Check through Nginx
curl -f http://localhost && echo "Status page OK"
curl -f http://localhost/admin && echo "Admin dashboard OK"

# Check from external IP
curl -f http://YOUR_VM_IP && echo "External access OK"
```

## 🔒 Security Configuration

### Step 1: Configure Firewall

```bash
# Install and configure UFW
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow essential services
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Optional: Allow direct access to services (for testing)
sudo ufw allow 1313/tcp
sudo ufw allow 3001/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status verbose
```

### Step 2: SSL/TLS Setup with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates
```

### Step 3: Secure Admin Access

```bash
# Edit Nginx configuration to restrict admin access
sudo nano /etc/nginx/sites-available/statuspage

# Add IP restrictions to admin location block:
location /admin {
    # Allow only internal networks
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    allow 172.16.0.0/12;
    deny all;
    
    proxy_pass http://localhost:3001;
    # ... rest of proxy configuration
}

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

## 📊 Monitoring & Maintenance

### Health Check Script

```bash
# Create health check script
sudo tee /opt/statuspage/health-check.sh > /dev/null <<'EOF'
#!/bin/bash

LOG_FILE="/var/log/statuspage-health.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log messages
log_message() {
    echo "[$DATE] $1" >> $LOG_FILE
}

# Check Hugo service
if curl -f http://localhost:1313 > /dev/null 2>&1; then
    log_message "Hugo service: OK"
else
    log_message "Hugo service: FAILED"
    sudo systemctl restart statuspage-hugo
fi

# Check Admin service
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    log_message "Admin service: OK"
else
    log_message "Admin service: FAILED"
    sudo systemctl restart statuspage-admin
fi

# Check disk space
DISK_USAGE=$(df /opt/statuspage | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    log_message "WARNING: Disk usage is ${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 80 ]; then
    log_message "WARNING: Memory usage is ${MEM_USAGE}%"
fi
EOF

# Make executable
sudo chmod +x /opt/statuspage/health-check.sh

# Add to crontab (run every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/statuspage/health-check.sh") | crontab -
```

### Backup Script

```bash
# Create backup script
sudo tee /opt/statuspage/backup.sh > /dev/null <<'EOF'
#!/bin/bash

BACKUP_DIR="/backup/statuspage"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="statuspage_backup_$DATE.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
tar -czf $BACKUP_DIR/$BACKUP_FILE \
    --exclude='node_modules' \
    --exclude='public' \
    --exclude='.git' \
    /opt/statuspage/

# Keep only last 7 backups
find $BACKUP_DIR -name "statuspage_backup_*.tar.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_DIR/$BACKUP_FILE"
EOF

# Make executable
sudo chmod +x /opt/statuspage/backup.sh

# Add to crontab (daily backup at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/statuspage/backup.sh") | crontab -
```

### Log Rotation

```bash
# Configure log rotation
sudo tee /etc/logrotate.d/statuspage > /dev/null <<EOF
/var/log/statuspage-health.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
```

## 🚨 Troubleshooting

### Common Issues and Solutions

1. **Services not starting:**
```bash
# Check service logs
sudo journalctl -u statuspage-hugo -f
sudo journalctl -u statuspage-admin -f

# Check port availability
sudo netstat -tlnp | grep -E ':(1313|3001)'

# Restart services
sudo systemctl restart statuspage-hugo statuspage-admin
```

2. **Permission issues:**
```bash
# Fix ownership
sudo chown -R www-data:www-data /opt/statuspage

# Fix permissions
sudo chmod -R 755 /opt/statuspage
sudo chmod +x /opt/statuspage/admin/server.js
```

3. **Nginx configuration issues:**
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

4. **Memory issues:**
```bash
# Check memory usage
free -h
htop

# Restart services to free memory
sudo systemctl restart statuspage-hugo statuspage-admin nginx
```

### Useful Commands

```bash
# Service management
sudo systemctl status statuspage-hugo statuspage-admin
sudo systemctl restart statuspage-hugo statuspage-admin
sudo systemctl stop statuspage-hugo statuspage-admin

# View logs
sudo journalctl -u statuspage-hugo --since "1 hour ago"
sudo journalctl -u statuspage-admin --since "1 hour ago"

# Check resource usage
htop
df -h
free -h

# Network diagnostics
sudo netstat -tlnp
sudo ss -tlnp

# Test connectivity
curl -I http://localhost:1313
curl -I http://localhost:3001
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Check service status
   - Review logs for errors
   - Verify backups

2. **Monthly:**
   - Update system packages
   - Review disk usage
   - Test SSL certificate renewal

3. **Quarterly:**
   - Update Hugo version
   - Update Node.js dependencies
   - Security audit

### Getting Help

- **GitHub Issues**: https://github.com/shrivastavarachit/statusPage/issues
- **Service Logs**: Check systemd journals for detailed error messages
- **Health Checks**: Monitor `/var/log/statuspage-health.log`

---

**🎉 Congratulations! Your Tekion IT Status Page is now deployed and running on your VM!**

Access your status page at: `http://YOUR_VM_IP` or `https://your-domain.com`
Access admin dashboard at: `http://YOUR_VM_IP/admin` or `https://your-domain.com/admin`
