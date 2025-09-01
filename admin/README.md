# 🛠️ Tekion IT Status - Local Admin Dashboard

## 🚀 Quick Start (2 minutes setup!)

### Prerequisites
- **Node.js** (already installed ✅)
- **Hugo** (already installed ✅)

### Start the Admin Dashboard

#### Option 1: Using the startup script
```bash
cd admin/
./start.sh
```

#### Option 2: Using Node.js directly
```bash
cd admin/
node server.js
```

#### Option 3: Using npm
```bash
cd admin/
npm start
```

### 🎯 Access Your Dashboard
Open your browser to: **http://localhost:3001**

## ✨ Features

### 🟢 Real-Time Service Status Management
- **Click any status badge** to cycle through: Operational → Disrupted → Down
- **Instant updates** to your live status page
- **Auto Hugo rebuild** after each change

### 🚨 Incident Management
- **Create incidents** with title, severity, and affected services
- **Update incidents** with new information
- **Resolve incidents** when issues are fixed
- **Delete incidents** if needed
- **All changes appear immediately** on your status page

### 🔄 Auto-Sync
- **Reads existing incidents** from your content/issues/ directory
- **Creates new .md files** when you add incidents
- **Updates existing files** when you modify incidents
- **Triggers Hugo rebuild** automatically

## 🎮 How to Use

### 1. **Change Service Status**
1. Open http://localhost:3001
2. Find any service (e.g., "Bangalore ISP Tata Comms")
3. Click the status badge to change it
4. Watch it update on your live status page!

### 2. **Create New Incident**
1. Fill out the "Create New Incident" form
2. Select severity and affected services
3. Click "Create Incident"
4. New incident appears immediately on status page

### 3. **Manage Active Incidents**
1. See all active incidents in the bottom section
2. Click "Update" to add new information
3. Click "Resolve" to mark as fixed
4. Click "Delete" to remove completely

## 🔧 Technical Details

### File Structure
```
admin/
├── server.js          # Local Node.js server
├── index.html         # Admin dashboard UI
├── admin.js           # Frontend JavaScript
├── package.json       # Node.js configuration
├── start.sh           # Startup script
└── README.md          # This file

../content/issues/     # Your Hugo content
├── *.md              # Incident files (auto-managed)
```

### How It Works
1. **Node.js server** runs on port 3001
2. **Serves admin dashboard** at http://localhost:3001
3. **API endpoints** handle CRUD operations on markdown files
4. **Hugo rebuilds** automatically after each change
5. **Changes appear live** on your status page

### API Endpoints
- `GET /api/services` - Get all services
- `GET /api/incidents` - Get all incidents
- `POST /api/incidents` - Create new incident
- `PUT /api/incidents/:filename` - Update incident
- `DELETE /api/incidents/:filename` - Delete incident
- `POST /api/services/update` - Update service status

## 🛑 Stopping the Server
Press **Ctrl+C** in the terminal to stop the admin server.

## 🔍 Troubleshooting

### Issue: "Port 3001 already in use"
**Solution**: Kill existing process or change port in server.js

### Issue: "Hugo command not found"
**Solution**: Make sure Hugo is installed and in your PATH

### Issue: "Permission denied"
**Solution**: Make sure you have write permissions to content/issues/

### Issue: Changes not appearing
**Solution**: 
1. Check terminal for Hugo build errors
2. Refresh your status page
3. Check that Hugo is serving from the correct directory

## 🎉 You're Ready!

Your local admin dashboard is now running and ready to manage your Tekion IT Status page in real-time!

**Dashboard**: http://localhost:3001
**Status Page**: http://localhost:1313 (if running Hugo server)

Happy status page managing! 🚀
