# 🚀 Simple Azure VM Deployment

## Step-by-Step Deployment Guide

### 1. Prepare Your Azure VM

SSH into your VM:
```bash
ssh azureuser@YOUR_VM_IP
```

Install Docker and Docker Compose:
```bash
# Update system
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
ssh azureuser@YOUR_VM_IP
```

### 2. Copy Your Project to VM

From your local machine:
```bash
# Copy all files to VM
scp -r . azureuser@YOUR_VM_IP:~/tekion-status/
```

### 3. Deploy with Docker Compose

SSH back into your VM:
```bash
ssh azureuser@YOUR_VM_IP
cd ~/tekion-status
```

Start the application:
```bash
docker-compose up -d --build
```

### 4. Configure Firewall

Allow HTTP traffic:
```bash
sudo ufw allow 80
sudo ufw allow 3001
sudo ufw enable
```

### 5. Access Your Status Page

- **Status Page (Users)**: http://YOUR_VM_IP/
- **Admin Panel**: http://YOUR_VM_IP:3001/

## Port Mapping

- **Port 80**: Main status page (Hugo site)
- **Port 3001**: Admin panel for managing incidents

## Management Commands

### View logs:
```bash
docker-compose logs -f
```

### Restart services:
```bash
docker-compose restart
```

### Stop services:
```bash
docker-compose down
```

### Update and redeploy:
```bash
# Copy new files from local
scp -r . azureuser@YOUR_VM_IP:~/tekion-status/

# SSH and rebuild
ssh azureuser@YOUR_VM_IP
cd ~/tekion-status
docker-compose up -d --build
```

## That's it! 🎉

Your Tekion IT Status Page is now running on Azure VM with:
- ✅ Main status page on port 80
- ✅ Admin panel on port 3001  
- ✅ Real-time incident management
- ✅ Automatic Hugo rebuilds
- ✅ Persistent data storage
