# 👨‍💼 Admin Guide - Tekion IT Status Page

Complete guide for managing incidents and services through the admin dashboard.

## 🚀 Quick Start

### Access Admin Dashboard
- **URL**: http://localhost:3001 (or your-domain.com/admin)
- **Interface**: Web-based dashboard
- **Real-time Updates**: Changes reflect immediately on status page

### Dashboard Overview
The admin dashboard provides:
- **Incident Management**: Create, update, and resolve incidents
- **Service Status Control**: Monitor and update individual services
- **Real-time Preview**: See changes as they appear on the status page
- **Incident History**: Track all past incidents and resolutions

## 📋 Service Management

### Current Services
The status page monitors these services:
1. **Bangalore ISP Tata Comms** - Primary ISP connection
2. **Bangalore ISP Tata Tele** - Secondary ISP connection  
3. **Bangalore ISP Airtel** - Tertiary ISP connection
4. **Corp VPN** - Corporate VPN access
5. **API Services** - Internal API endpoints
6. **Media Proxy** - Media streaming services

### Service Status Types
- **🟢 Operational** - Service is working normally
- **🟡 Degraded** - Service has minor issues but is functional
- **🔴 Down** - Service is completely unavailable
- **🔵 Maintenance** - Planned maintenance in progress

## 🚨 Incident Management

### Creating New Incidents

1. **Access Admin Dashboard**
   ```
   http://localhost:3001
   ```

2. **Fill Incident Details**
   - **Title**: Brief, descriptive title (e.g., "VPN Connection Issues")
   - **Description**: Detailed explanation of the issue
   - **Affected Services**: Select one or more services from dropdown
   - **Severity Level**: Choose appropriate severity

3. **Severity Levels**
   - **Notice** 🔵: Minor issues, informational updates
   - **Disrupted** 🟡: Partial service degradation
   - **Down** 🔴: Complete service outage

4. **Submit Incident**
   - Click "Create Incident" button
   - Incident appears immediately on status page
   - Markdown file created in `content/issues/`

### Incident Workflow

```
Create Incident → Monitor → Update → Resolve
     ↓              ↓         ↓        ↓
  Published    Investigating  Update   Resolved
```

### Example Incident Creation

**Scenario**: VPN service is experiencing connection issues

```
Title: VPN Connection Intermittent Issues
Description: Users may experience difficulty connecting to the corporate VPN. 
Our team is investigating the issue and working on a resolution.
Affected Services: Corp VPN
Severity: Disrupted
```

### Updating Incidents

1. **Locate Incident File**
   ```bash
   # Files are stored in content/issues/
   ls content/issues/
   ```

2. **Edit Incident File**
   ```markdown
   ---
   title: "VPN Connection Intermittent Issues"
   date: 2025-09-01T10:30:00+05:30
   resolved: false
   resolvedWhen: ""
   severity: disrupted
   affected:
     - Corp VPN
   section: issue
   ---

   **Update 11:00 AM**: We have identified the root cause and are implementing a fix.
   
   **Update 11:30 AM**: The issue has been resolved. VPN connections should now work normally.
   ```

3. **Resolve Incident**
   ```markdown
   ---
   resolved: true
   resolvedWhen: 2025-09-01T11:30:00+05:30
   ---
   ```

## 📊 Status Page Behavior

### Status Indicator Logic
The main status indicator shows:
- **All Systems Operational** 🟢: No active incidents
- **Service Notice** 🔵: Only "notice" severity incidents
- **Partial Service Disruption** 🟡: "disrupted" severity incidents
- **Major Service Outage** 🔴: "down" severity incidents

### Service Status Display
- Services are displayed in a collapsible section
- Each service shows current status with colored indicators
- Status updates automatically when incidents are created/resolved

## 🔧 Technical Details

### File Structure
```
content/issues/
├── 2025-09-01-vpn-connection-issues.md
├── 2025-08-30-api-maintenance.md
└── ...

data/
└── services.json

layouts/partials/
├── index/summary.html
└── services-status.html
```

### Incident File Format
```markdown
---
title: "Incident Title"
date: 2025-09-01T10:00:00+05:30
resolved: false
resolvedWhen: ""
severity: disrupted  # notice, disrupted, down
affected:
  - Service Name 1
  - Service Name 2
section: issue
---

Initial incident description.

**Update**: Additional information as situation develops.
```

### Services Configuration
```json
{
  "services": [
    {
      "name": "Bangalore ISP Tata Comms",
      "status": "operational",
      "description": "Primary ISP connection"
    }
  ]
}
```

## 🎯 Best Practices

### Incident Communication

1. **Be Clear and Concise**
   ```
   ✅ Good: "VPN service experiencing connection timeouts"
   ❌ Bad: "Some users might have issues with stuff"
   ```

2. **Provide Regular Updates**
   ```markdown
   **10:30 AM**: Issue identified, investigating
   **11:00 AM**: Root cause found, implementing fix
   **11:30 AM**: Issue resolved, monitoring
   ```

3. **Use Appropriate Severity**
   - **Notice**: Planned maintenance, minor issues
   - **Disrupted**: Partial functionality affected
   - **Down**: Complete service unavailable

### Incident Titles
- Keep titles under 60 characters
- Be specific about the service and issue
- Use present tense for ongoing issues
- Examples:
  - "API Services Experiencing High Latency"
  - "Bangalore ISP Tata Comms Connection Down"
  - "Scheduled Maintenance: Corp VPN"

### Service Selection
- Select all affected services
- Be accurate - don't over-select services
- If unsure, start with fewer services and add more if needed

## 📱 Mobile Management

### Mobile-Friendly Admin
The admin dashboard is responsive and works on mobile devices:
- Touch-friendly interface
- Optimized forms for mobile input
- Quick incident creation on-the-go

### Mobile Workflow
1. Access admin dashboard on mobile browser
2. Create incident with essential details
3. Add updates from desktop later if needed

## 🔍 Monitoring & Analytics

### Incident Metrics
Track these metrics for better service management:
- **Mean Time to Detection (MTTD)**: How quickly issues are identified
- **Mean Time to Resolution (MTTR)**: How quickly issues are resolved
- **Incident Frequency**: Number of incidents per service/time period
- **Service Availability**: Uptime percentage per service

### Status Page Analytics
Monitor status page usage:
- Page views during incidents
- Most viewed incident updates
- User engagement with status updates

## 🚨 Emergency Procedures

### Critical Incident Response

1. **Immediate Actions**
   ```bash
   # Quick incident creation
   curl -X POST http://localhost:3001/api/incidents \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Critical System Outage",
       "severity": "down",
       "affected": ["All Services"],
       "description": "Investigating critical system outage"
     }'
   ```

2. **Communication Timeline**
   - **0-5 minutes**: Create initial incident
   - **5-15 minutes**: Provide first update
   - **Every 15-30 minutes**: Regular updates during resolution
   - **Post-resolution**: Final update and resolution

### Escalation Matrix
- **Notice**: IT team handles
- **Disrupted**: IT manager notified
- **Down**: All stakeholders notified immediately

## 🔧 Advanced Features

### Bulk Operations
```bash
# Create multiple incidents from script
for service in "API Services" "Media Proxy"; do
  curl -X POST http://localhost:3001/api/incidents \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Maintenance: $service\",
      \"severity\": \"notice\",
      \"affected\": [\"$service\"],
      \"description\": \"Scheduled maintenance in progress\"
    }"
done
```

### Automated Monitoring Integration
```javascript
// Example: Auto-create incident from monitoring alert
const createIncident = async (alertData) => {
  const incident = {
    title: `${alertData.service} - ${alertData.alert}`,
    severity: alertData.severity,
    affected: [alertData.service],
    description: `Automated alert: ${alertData.description}`
  };
  
  await fetch('http://localhost:3001/api/incidents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(incident)
  });
};
```

## 📞 Support & Troubleshooting

### Common Issues

1. **Admin dashboard not accessible**
   ```bash
   # Check if admin server is running
   curl http://localhost:3001
   
   # Restart admin server
   cd admin && node server.js
   ```

2. **Changes not reflecting on status page**
   ```bash
   # Restart Hugo server
   hugo server --bind 0.0.0.0 --port 1313
   ```

3. **Incident file creation errors**
   ```bash
   # Check permissions
   ls -la content/issues/
   
   # Fix permissions
   chmod 755 content/issues/
   ```

### Debug Mode
```bash
# Run admin server with debug logging
DEBUG=* node admin/server.js
```

### Log Files
- Admin server logs: Check console output
- Hugo server logs: Check console output
- Incident files: `content/issues/*.md`
- Service data: `data/services.json`

## 📚 Quick Reference

### Keyboard Shortcuts
- **Ctrl+Enter**: Submit incident form
- **Esc**: Close modal dialogs
- **Tab**: Navigate form fields

### API Endpoints
- `POST /api/incidents` - Create incident
- `PUT /api/incidents/:id` - Update incident
- `DELETE /api/incidents/:id` - Delete incident
- `GET /api/services` - Get service status
- `PUT /api/services/:name` - Update service status

### File Locations
- Incidents: `content/issues/`
- Services: `data/services.json`
- Templates: `layouts/partials/`
- Admin: `admin/`

---

**🎯 Remember**: The goal is clear, timely communication with users about service status. Keep updates factual, helpful, and regular during incidents.
