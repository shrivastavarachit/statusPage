// Admin Dashboard JavaScript
class StatusAdmin {
    constructor() {
        this.apiUrl = 'http://localhost:3001/api';
        this.services = [];
        this.incidents = [];
        this.init();
    }
    
    async init() {
        this.bindEvents();
        await this.loadData();
        this.updateDisplay();
    }

    async loadData() {
        try {
            // Load services
            const servicesResponse = await fetch(`${this.apiUrl}/services`);
            const servicesData = await servicesResponse.json();
            if (servicesData.success) {
                this.services = servicesData.data;
            }

            // Load incidents
            const incidentsResponse = await fetch(`${this.apiUrl}/incidents`);
            const incidentsData = await incidentsResponse.json();
            if (incidentsData.success) {
                this.incidents = incidentsData.data.filter(i => {
                    const resolved = i.frontMatter.resolved;
                    return resolved === 'false' || resolved === false;
                });
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            this.showNotification('Failed to load data from server', 'error');
        }
    }
    
    bindEvents() {
        // Incident form submission
        document.getElementById('incidentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createIncident();
        });
    }
    
    async toggleStatus(button) {
        const currentStatus = button.textContent.toLowerCase();
        let newStatus;

        switch(currentStatus) {
            case 'operational':
                newStatus = 'disrupted';
                break;
            case 'disrupted':
                newStatus = 'down';
                break;
            case 'down':
                newStatus = 'operational';
                break;
            default:
                newStatus = 'operational';
        }

        const serviceName = button.parentElement.querySelector('.service-name').textContent;

        try {
            // Update on server
            const response = await fetch(`${this.apiUrl}/services/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    service: serviceName,
                    status: newStatus
                })
            });

            const result = await response.json();

            if (result.success) {
                // Update button
                button.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
                button.className = `status-badge status-${newStatus}`;

                // Update service in memory
                const service = this.services.find(s => s.name === serviceName);
                if (service) {
                    service.status = newStatus;
                }

                this.showNotification(`${serviceName} status updated to ${newStatus}. Site rebuilding...`);
            } else {
                this.showNotification(`Failed to update ${serviceName}: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Failed to update service status:', error);
            this.showNotification(`Failed to update ${serviceName}`, 'error');
        }
    }
    
    async createIncident() {
        const title = document.getElementById('incidentTitle').value;
        const severity = document.getElementById('incidentSeverity').value;
        const description = document.getElementById('incidentDescription').value;
        const affectedSelect = document.getElementById('affectedServices');
        const affected = Array.from(affectedSelect.selectedOptions).map(option => option.value);

        if (!title || !severity || !description) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/incidents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    severity,
                    description,
                    affected
                })
            });

            const result = await response.json();

            if (result.success) {
                // Clear form
                document.getElementById('incidentForm').reset();

                // Reload incidents
                await this.loadData();
                this.updateIncidentsDisplay();

                this.showNotification(`Incident "${title}" created successfully. Site rebuilding...`);
            } else {
                this.showNotification(`Failed to create incident: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Failed to create incident:', error);
            this.showNotification('Failed to create incident', 'error');
        }
    }

    async updateIncident(button) {
        const incidentElement = button.closest('.incident-item');
        const title = incidentElement.querySelector('.incident-title').textContent;

        const newUpdate = prompt(`Add update for "${title}":`, 'Update - ');
        if (newUpdate) {
            // Find incident
            const incident = this.incidents.find(i => i.frontMatter.title === title);
            if (incident) {
                try {
                    const response = await fetch(`${this.apiUrl}/incidents/${incident.filename}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            update: newUpdate
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        await this.loadData();
                        this.updateIncidentsDisplay();
                        this.showNotification(`Incident "${title}" updated. Site rebuilding...`);
                    } else {
                        this.showNotification(`Failed to update incident: ${result.error}`, 'error');
                    }
                } catch (error) {
                    console.error('Failed to update incident:', error);
                    this.showNotification('Failed to update incident', 'error');
                }
            }
        }
    }
    
    async resolveIncident(button) {
        const incidentElement = button.closest('.incident-item');
        const title = incidentElement.querySelector('.incident-title').textContent;

        if (confirm(`Mark "${title}" as resolved?`)) {
            const incident = this.incidents.find(i => i.frontMatter.title === title);
            if (incident) {
                try {
                    const response = await fetch(`${this.apiUrl}/incidents/${incident.filename}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            resolved: true
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        await this.loadData();
                        this.updateIncidentsDisplay();
                        this.showNotification(`Incident "${title}" resolved. Site rebuilding...`);
                    } else {
                        this.showNotification(`Failed to resolve incident: ${result.error}`, 'error');
                    }
                } catch (error) {
                    console.error('Failed to resolve incident:', error);
                    this.showNotification('Failed to resolve incident', 'error');
                }
            }
        }
    }
    
    async deleteIncident(button) {
        const incidentElement = button.closest('.incident-item');
        const title = incidentElement.querySelector('.incident-title').textContent;

        if (confirm(`Delete incident "${title}"? This cannot be undone.`)) {
            const incident = this.incidents.find(i => i.frontMatter.title === title);
            if (incident) {
                try {
                    const response = await fetch(`${this.apiUrl}/incidents/${incident.filename}`, {
                        method: 'DELETE'
                    });

                    const result = await response.json();

                    if (result.success) {
                        await this.loadData();
                        this.updateIncidentsDisplay();
                        this.showNotification(`Incident "${title}" deleted. Site rebuilding...`);
                    } else {
                        this.showNotification(`Failed to delete incident: ${result.error}`, 'error');
                    }
                } catch (error) {
                    console.error('Failed to delete incident:', error);
                    this.showNotification('Failed to delete incident', 'error');
                }
            }
        }
    }
    
    updateDisplay() {
        this.updateServicesDisplay();
        this.updateIncidentsDisplay();
    }

    updateServicesDisplay() {
        const container = document.getElementById('servicesList');

        if (this.services.length === 0) {
            container.innerHTML = '<p style="color: #6c757d; font-style: italic;">Loading services...</p>';
            return;
        }

        container.innerHTML = this.services.map(service => `
            <div class="service-item">
                <span class="service-name">${service.name}</span>
                <button class="status-badge status-${service.status}" onclick="statusAdmin.toggleStatus(this)">
                    ${service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </button>
            </div>
        `).join('');
    }
    
    updateIncidentsDisplay() {
        const container = document.getElementById('activeIncidents');
        const activeIncidents = this.incidents.filter(i => {
            const resolved = i.frontMatter.resolved;
            return resolved === 'false' || resolved === false;
        });

        if (activeIncidents.length === 0) {
            container.innerHTML = '<p style="color: #6c757d; font-style: italic;">No active incidents</p>';
            return;
        }

        container.innerHTML = activeIncidents.map(incident => {
            const title = incident.frontMatter.title || 'Untitled';
            const severity = incident.frontMatter.severity || 'notice';
            const date = incident.frontMatter.date || new Date().toISOString();
            const affected = incident.frontMatter.affected || [];
            const content = incident.content || 'No description';

            return `
                <div class="incident-item">
                    <div class="incident-title">${title}</div>
                    <div class="incident-meta">
                        <span class="status-badge status-${severity}">${severity.charAt(0).toUpperCase() + severity.slice(1)}</span> •
                        Created: ${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()} •
                        Affected: ${Array.isArray(affected) ? affected.join(', ') : affected}
                    </div>
                    <div>${content}</div>
                    <div class="incident-actions">
                        <button class="btn btn-primary" onclick="statusAdmin.updateIncident(this)">Update</button>
                        <button class="btn btn-primary" onclick="statusAdmin.resolveIncident(this)">Resolve</button>
                        <button class="btn btn-danger" onclick="statusAdmin.deleteIncident(this)">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    generateIncidentFile(incident) {
        const filename = `${incident.created.toISOString().split('T')[0]}-${incident.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.md`;
        
        const frontMatter = `---
title: ${incident.title}
date: ${incident.created.toISOString()}
resolved: ${incident.resolved}
${incident.resolved ? `resolvedWhen: ${incident.resolvedWhen.toISOString()}` : ''}
severity: ${incident.severity}
affected:
${incident.affected.map(service => `  - ${service}`).join('\n')}
section: issue
---

*Investigating* - ${incident.description}

${incident.updates ? incident.updates.map(update => `*${update.timestamp.toLocaleDateString()}* - ${update.text}`).join('\n\n') : ''}`;

        this.downloadFile(filename, frontMatter);
    }
    
    generateStatusUpdate(serviceName, status) {
        console.log(`Status Update: ${serviceName} is now ${status}`);
        // In a real implementation, this would update the Hugo config or create status files
    }
    
    downloadFile(filename, content) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
    
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? '#dc3545' : '#00D15A';

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Global functions for onclick handlers
function toggleStatus(button) {
    statusAdmin.toggleStatus(button);
}

function updateIncident(button) {
    statusAdmin.updateIncident(button);
}

function resolveIncident(button) {
    statusAdmin.resolveIncident(button);
}

function deleteIncident(button) {
    statusAdmin.deleteIncident(button);
}

// Initialize the admin dashboard
const statusAdmin = new StatusAdmin();
