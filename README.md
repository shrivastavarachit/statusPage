# Tekion IT Status Page

A modern, professional status page built with Hugo and cState theme, featuring a custom admin dashboard for real-time incident management.

## 🌟 Features

### Status Page
- **Clean, Professional Design** - Atlassian-inspired landing page
- **Real-time Status Updates** - Dynamic service status display
- **Collapsible Service Status** - Organized service monitoring
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Custom Branding** - Clean, professional styling
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
┌─────────────────┐    ┌─────────────────┐
│   Status Page   │    │ Admin Dashboard │
│  (Port 1313)    │◄───┤   (Port 3001)   │
│   Hugo Server   │    │   Node.js App   │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │   Data Files    │
│   (HTML/CSS/JS) │    │  (JSON/Markdown)│
└─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- Hugo Extended (v0.148.2+)
- Node.js 16+
- Git

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/shrivastavarachit/statusPage.git
cd statusPage
```

### 2. Install Dependencies
```bash
# Install admin dependencies
cd admin
npm install
cd ..
```

### 3. Start Services
```bash
# Terminal 1: Start Hugo server
hugo server --bind 0.0.0.0 --port 1313

# Terminal 2: Start Admin server
cd admin
node server.js
```

### 4. Access Applications
- **Status Page**: http://localhost:1313
- **Admin Dashboard**: http://localhost:3001

## 📖 Installation Guide

### System Requirements
- Hugo Extended (v0.148.2+)
- Node.js 16+
- Git

### Install Hugo Extended
```bash
# macOS
brew install hugo

# Ubuntu/Debian
sudo apt install hugo

# Or download directly
wget https://github.com/gohugoio/hugo/releases/download/v0.148.2/hugo_extended_0.148.2_linux-amd64.tar.gz
tar -xzf hugo_extended_0.148.2_linux-amd64.tar.gz
sudo mv hugo /usr/local/bin/
```

### Install Node.js
```bash
# macOS
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## 📚 Documentation

- **[Admin Guide](ADMIN-GUIDE.md)** - Managing incidents and services through the admin dashboard

## 🔧 Configuration

### Hugo Configuration (`config.yml`)
```yaml
baseURL: "http://localhost:1313"
languageCode: "en"
title: "Tekion IT Status"
theme: "cstate"

params:
  title: "Tekion IT Status"
  description: "Tekion IT infrastructure status page"
```

### Service Configuration
Services are configured in the admin dashboard and stored as data files.

## 👨‍💼 Admin Dashboard Usage

### Creating Incidents
1. **Access**: http://localhost:3001
2. **Fill Form**: Title, description, affected services, severity
3. **Submit**: Changes appear immediately on status page

### Severity Levels
- **Notice** 🔵: Minor issues, maintenance notifications
- **Disrupted** 🟡: Partial service degradation
- **Down** 🔴: Complete service outage

**[→ Complete Admin Guide](ADMIN-GUIDE.md)**

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check service status
curl -f http://localhost:1313 || echo "Status page down"
curl -f http://localhost:3001 || echo "Admin down"
```

### Backup Strategy
```bash
# Backup important data
cp -r ./data ./backup-data-$(date +%Y%m%d)
cp -r ./content ./backup-content-$(date +%Y%m%d)
```

## 🚨 Troubleshooting

### Common Issues

1. **Hugo server not starting**
```bash
# Check Hugo installation
hugo version

# Check port availability
netstat -tlnp | grep 1313

# Start Hugo server
hugo server --bind 0.0.0.0 --port 1313
```

2. **Admin dashboard not accessible**
```bash
# Check Node.js process
ps aux | grep node

# Start admin server
cd admin && node server.js
```

3. **Status not updating**
```bash
# Check if both servers are running
curl http://localhost:1313
curl http://localhost:3001

# Restart Hugo server
hugo server --bind 0.0.0.0 --port 1313
```

## 📞 Support

For issues and questions:
- **GitHub Issues**: https://github.com/shrivastavarachit/statusPage/issues
- **Admin Guide**: Check [ADMIN-GUIDE.md](ADMIN-GUIDE.md) for detailed usage instructions

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for Tekion IT Infrastructure Team**

## 🎯 Current Status

Your Tekion IT Status Page is now running with:
- ✅ **Status Page**: http://localhost:1313
- ✅ **Admin Dashboard**: http://localhost:3001
- ✅ **Clean, professional design** with Atlassian-inspired interface
- ✅ **Real-time incident management** through admin dashboard
- ✅ **Collapsible service status** section
- ✅ **Mobile-responsive** design

## License

MIT © Mantas Vilčinskas
