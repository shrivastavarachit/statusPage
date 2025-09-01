# Real-Time Admin Dashboard Setup

## 🚀 Quick Setup Guide

### Prerequisites
- **Web server** with PHP support (Apache, Nginx, or local server)
- **Hugo** installed and accessible via command line
- **Write permissions** on the content/issues directory

### Setup Steps

#### 1. **Move Admin Files to Web Server**
```bash
# Copy admin folder to your web server directory
cp -r admin/ /var/www/html/admin/
# OR for local development
cp -r admin/ /Applications/XAMPP/htdocs/admin/
```

#### 2. **Configure API Permissions**
```bash
# Make sure PHP can write to content directory
chmod 755 content/
chmod 755 content/issues/
chmod 644 content/issues/*.md
```

#### 3. **Test Hugo Command**
```bash
# Make sure Hugo works from admin directory
cd admin/
hugo --source=.. --destination=../public
```

#### 4. **Access Admin Dashboard**
- **Local**: http://localhost/admin/
- **Server**: http://yourserver.com/admin/

### 🔧 Configuration

#### Update Hugo Path (if needed)
Edit `admin/api.php` line 7:
```php
$HUGO_COMMAND = 'cd .. && /usr/local/bin/hugo --destination public';
```

#### Update Content Path (if needed)
Edit `admin/api.php` line 6:
```php
$CONTENT_DIR = '../content/issues/';
```

### 🎯 Features Now Working

#### ✅ Real-Time Service Status Updates
- Click any service status badge
- Automatically updates markdown files
- Triggers Hugo rebuild
- Changes appear on live site immediately

#### ✅ Real-Time Incident Management
- Create incidents → Automatically creates .md files
- Update incidents → Modifies existing files
- Resolve incidents → Updates resolved status
- Delete incidents → Removes .md files

#### ✅ Auto Site Rebuild
- Every change triggers `hugo` command
- Site rebuilds automatically
- Changes are live immediately

### 🛠️ Troubleshooting

#### Issue: "Failed to load data from server"
**Solution**: Check PHP error logs, ensure web server is running

#### Issue: "Hugo rebuild failed"
**Solution**: 
1. Check Hugo is installed: `hugo version`
2. Check path in api.php is correct
3. Check file permissions

#### Issue: Changes not appearing on site
**Solution**:
1. Check Hugo output directory is correct
2. Verify web server serves from Hugo's public directory
3. Clear browser cache

### 🔒 Security Notes

#### For Production Use:
1. **Add authentication** to admin dashboard
2. **Restrict access** to admin directory
3. **Validate all inputs** in API
4. **Use HTTPS** for admin access

#### Basic Authentication Example:
```php
// Add to top of api.php
if (!isset($_SERVER['PHP_AUTH_USER']) || $_SERVER['PHP_AUTH_USER'] !== 'admin') {
    header('WWW-Authenticate: Basic realm="Admin"');
    header('HTTP/1.0 401 Unauthorized');
    exit('Access denied');
}
```

### 📁 File Structure
```
admin/
├── index.html      # Admin dashboard interface
├── admin.js        # Real-time JavaScript functionality
├── api.php         # Backend API for file operations
└── setup.md        # This setup guide

content/issues/     # Hugo content directory
├── *.md           # Incident markdown files (auto-managed)

public/            # Hugo output directory
├── index.html     # Generated status page
```

### 🎉 You're Ready!

Your admin dashboard now has **real-time functionality**:

1. **Open**: http://localhost/admin/
2. **Click** any service status to change it
3. **Create** new incidents using the form
4. **Watch** changes appear on your live status page immediately!

The dashboard will automatically:
- ✅ Create/modify markdown files
- ✅ Rebuild your Hugo site
- ✅ Update the live status page
- ✅ Show success/error notifications
