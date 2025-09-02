const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const JiraIntegration = require('./jira-integration');

const PORT = 3001;
const CONTENT_DIR = '../content/issues/';
const SERVICES_FILE = '../data/services.json';

class LocalStatusServer {
    constructor() {
        this.server = http.createServer((req, res) => this.handleRequest(req, res));
        this.jira = new JiraIntegration();
    }

    start() {
        this.server.listen(PORT, () => {
            console.log(`🚀 Admin Dashboard running at: http://localhost:${PORT}`);
            console.log('📁 Managing content in:', path.resolve(CONTENT_DIR));
            console.log('🛠️  Ready to manage your status page!');
        });
    }

    handleRequest(req, res) {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        // Serve static files
        if (req.method === 'GET' && !url.pathname.startsWith('/api/')) {
            this.serveStaticFile(req, res);
            return;
        }

        // Handle API requests
        if (url.pathname.startsWith('/api/')) {
            this.handleAPI(req, res, url);
            return;
        }

        // 404
        res.writeHead(404);
        res.end('Not Found');
    }

    serveStaticFile(req, res) {
        let filePath = req.url === '/' ? '/index.html' : req.url;
        filePath = path.join(__dirname, filePath);

        const extname = path.extname(filePath);
        const contentType = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json'
        }[extname] || 'text/plain';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    }

    handleAPI(req, res, url) {
        const path = url.pathname.replace('/api/', '');
        
        if (req.method === 'GET') {
            this.handleGet(path, res);
        } else if (req.method === 'POST') {
            this.handlePost(path, req, res);
        } else if (req.method === 'PUT') {
            this.handlePut(path, req, res);
        } else if (req.method === 'DELETE') {
            this.handleDelete(path, res);
        }
    }

    handleGet(path, res) {
        if (path === 'incidents') {
            this.getIncidents(res);
        } else if (path === 'services') {
            this.getServices(res);
        } else if (path === 'jira/config') {
            this.getJiraConfig(res);
        } else if (path === 'jira/test') {
            this.testJiraConnection(res);
        } else {
            this.sendError(res, 'Not found', 404);
        }
    }

    handlePost(path, req, res) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                
                if (path === 'incidents') {
                    this.createIncident(data, res);
                } else if (path === 'services/update') {
                    this.updateServiceStatus(data, res);
                } else {
                    this.sendError(res, 'Not found', 404);
                }
            } catch (error) {
                this.sendError(res, 'Invalid JSON', 400);
            }
        });
    }

    handlePut(path, req, res) {
        if (path.startsWith('incidents/')) {
            const filename = path.replace('incidents/', '');
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    this.updateIncident(filename, data, res);
                } catch (error) {
                    this.sendError(res, 'Invalid JSON', 400);
                }
            });
        } else {
            this.sendError(res, 'Not found', 404);
        }
    }

    handleDelete(path, res) {
        if (path.startsWith('incidents/')) {
            const filename = path.replace('incidents/', '');
            this.deleteIncident(filename, res);
        } else {
            this.sendError(res, 'Not found', 404);
        }
    }

    getIncidents(res) {
        const incidentsDir = path.resolve(CONTENT_DIR);
        
        fs.readdir(incidentsDir, (err, files) => {
            if (err) {
                this.sendError(res, 'Failed to read incidents directory');
                return;
            }

            const incidents = [];
            const mdFiles = files.filter(file => file.endsWith('.md'));

            let processed = 0;
            if (mdFiles.length === 0) {
                this.sendSuccess(res, incidents);
                return;
            }

            mdFiles.forEach(file => {
                const filePath = path.join(incidentsDir, file);
                fs.readFile(filePath, 'utf8', (err, content) => {
                    if (!err) {
                        const parsed = this.parseMarkdownFile(content, file);
                        if (parsed) {
                            incidents.push(parsed);
                        }
                    }
                    
                    processed++;
                    if (processed === mdFiles.length) {
                        this.sendSuccess(res, incidents);
                    }
                });
            });
        });
    }

    getServices(res) {
        const servicesPath = path.resolve(SERVICES_FILE);

        fs.readFile(servicesPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Failed to read services file:', err);
                // Return default services if file doesn't exist
                const defaultServices = [
                    { name: 'Bangalore ISP Tata Comms', status: 'operational' },
                    { name: 'Bangalore ISP Tata Tele', status: 'operational' },
                    { name: 'Bangalore ISP Airtel', status: 'operational' },
                    { name: 'Corp VPN', status: 'operational' },
                    { name: 'API', status: 'operational' },
                    { name: 'Media Proxy', status: 'operational' }
                ];
                this.sendSuccess(res, defaultServices);
                return;
            }

            try {
                const servicesData = JSON.parse(data);
                this.sendSuccess(res, servicesData.services || []);
            } catch (parseError) {
                console.error('Failed to parse services file:', parseError);
                this.sendError(res, 'Failed to parse services data');
            }
        });
    }

    async createIncident(data, res) {
        const { title, severity, description, affected, createJiraTicket } = data;

        if (!title || !description) {
            this.sendError(res, 'Title and description are required');
            return;
        }

        const date = new Date();
        const filename = `${date.toISOString().split('T')[0]}-${this.slugify(title)}.md`;
        const filepath = path.resolve(CONTENT_DIR, filename);

        let jiraTicket = null;
        let jiraError = null;

        // Create Jira ticket if requested and integration is enabled
        if (createJiraTicket && this.jira.enabled) {
            console.log('🎫 Creating Jira ticket for incident...');
            try {
                jiraTicket = await this.jira.createTicket({
                    title,
                    severity: severity || 'notice',
                    description,
                    affected
                });

                if (jiraTicket && jiraTicket.error) {
                    jiraError = jiraTicket.message;
                    jiraTicket = null;
                }
            } catch (error) {
                console.error('Failed to create Jira ticket:', error);
                jiraError = error.message;
            }
        }

        // Build front matter with optional Jira ticket info
        let frontMatter = `---
title: ${title}
date: ${date.toISOString()}
resolved: false
severity: ${severity || 'notice'}
${affected && affected.length > 0 ? `affected:\n${affected.map(s => `  - ${s}`).join('\n')}` : ''}`;

        if (jiraTicket) {
            frontMatter += `\njiraTicket: ${jiraTicket.key}
jiraUrl: ${jiraTicket.url}`;
        }

        frontMatter += `\nsection: issue
---

*Investigating* - ${description}`;

        if (jiraTicket) {
            frontMatter += `\n\n**Jira Ticket:** [${jiraTicket.key}](${jiraTicket.url})`;
        }

        fs.writeFile(filepath, frontMatter, (err) => {
            if (err) {
                this.sendError(res, 'Failed to create incident file');
                return;
            }

            this.rebuildSite(() => {
                const response = {
                    message: 'Incident created',
                    filename,
                    jiraTicket: jiraTicket ? {
                        key: jiraTicket.key,
                        url: jiraTicket.url
                    } : null
                };

                if (jiraError) {
                    response.jiraError = jiraError;
                }

                this.sendSuccess(res, response);
            });
        });
    }

    updateIncident(filename, data, res) {
        const filepath = path.resolve(CONTENT_DIR, filename);
        
        fs.readFile(filepath, 'utf8', (err, content) => {
            if (err) {
                this.sendError(res, 'Incident not found', 404);
                return;
            }

            const parsed = this.parseMarkdownFile(content, filename);
            if (!parsed) {
                this.sendError(res, 'Failed to parse incident file');
                return;
            }

            // Update fields
            if (data.resolved !== undefined) {
                parsed.frontMatter.resolved = data.resolved;
                if (data.resolved) {
                    parsed.frontMatter.resolvedWhen = new Date().toISOString();
                }
            }

            if (data.update) {
                parsed.content = `*${new Date().toLocaleDateString()}* - ${data.update}\n\n${parsed.content}`;
            }

            const newContent = this.buildMarkdownFile(parsed.frontMatter, parsed.content);
            
            fs.writeFile(filepath, newContent, (err) => {
                if (err) {
                    this.sendError(res, 'Failed to update incident');
                    return;
                }

                this.rebuildSite(() => {
                    this.sendSuccess(res, { message: 'Incident updated' });
                });
            });
        });
    }

    deleteIncident(filename, res) {
        const filepath = path.resolve(CONTENT_DIR, filename);
        
        fs.unlink(filepath, (err) => {
            if (err) {
                this.sendError(res, 'Failed to delete incident', 404);
                return;
            }

            this.rebuildSite(() => {
                this.sendSuccess(res, { message: 'Incident deleted' });
            });
        });
    }

    updateServiceStatus(data, res) {
        const { service, status } = data;
        const servicesPath = path.resolve(SERVICES_FILE);

        console.log(`Service status update: ${service} -> ${status}`);

        // Read current services
        fs.readFile(servicesPath, 'utf8', (err, fileData) => {
            let servicesData;

            if (err) {
                // Create new services file if it doesn't exist
                servicesData = { services: [] };
            } else {
                try {
                    servicesData = JSON.parse(fileData);
                } catch (parseError) {
                    console.error('Failed to parse services file:', parseError);
                    this.sendError(res, 'Failed to parse services data');
                    return;
                }
            }

            // Find and update the service
            const serviceIndex = servicesData.services.findIndex(s => s.name === service);

            if (serviceIndex !== -1) {
                // Update existing service
                servicesData.services[serviceIndex].status = status;
                servicesData.services[serviceIndex].lastUpdated = new Date().toISOString();
            } else {
                // Add new service if not found
                servicesData.services.push({
                    name: service,
                    status: status,
                    category: 'Uncategorized',
                    lastUpdated: new Date().toISOString()
                });
            }

            // Write updated services back to file
            fs.writeFile(servicesPath, JSON.stringify(servicesData, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Failed to write services file:', writeErr);
                    this.sendError(res, 'Failed to update services file');
                    return;
                }

                console.log(`✅ Service ${service} updated to ${status}`);

                // Rebuild Hugo site
                this.rebuildSite(() => {
                    this.sendSuccess(res, { message: 'Service status updated' });
                });
            });
        });
    }

    parseMarkdownFile(content, filename) {
        const match = content.match(/^---\s*\n(.*?)\n---\s*\n(.*)$/s);
        if (!match) return null;

        const frontMatterText = match[1];
        const contentText = match[2].trim();

        const frontMatter = {};
        const lines = frontMatterText.split('\n');
        let currentKey = null;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('- ')) {
                if (currentKey && Array.isArray(frontMatter[currentKey])) {
                    frontMatter[currentKey].push(trimmed.substring(2));
                }
            } else if (trimmed.includes(':')) {
                const [key, ...valueParts] = trimmed.split(':');
                const value = valueParts.join(':').trim();
                currentKey = key.trim();
                
                if (value === '') {
                    frontMatter[currentKey] = [];
                } else {
                    frontMatter[currentKey] = value;
                }
            }
        }

        return { filename, frontMatter, content: contentText };
    }

    buildMarkdownFile(frontMatter, content) {
        let output = '---\n';
        
        for (const [key, value] of Object.entries(frontMatter)) {
            if (Array.isArray(value)) {
                output += `${key}:\n`;
                for (const item of value) {
                    output += `  - ${item}\n`;
                }
            } else {
                output += `${key}: ${value}\n`;
            }
        }
        
        output += '---\n\n';
        output += content;
        
        return output;
    }

    rebuildSite(callback) {
        const hugoCommand = 'cd .. && hugo --destination public';
        
        exec(hugoCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Hugo rebuild failed:', error);
            } else {
                console.log('✅ Site rebuilt successfully');
            }
            if (callback) callback();
        });
    }

    slugify(text) {
        return text.toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '');
    }

    sendSuccess(res, data = null) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data }));
    }

    sendError(res, message, code = 400) {
        res.writeHead(code, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: message }));
    }

    getJiraConfig(res) {
        const config = this.jira.getConfig();
        this.sendSuccess(res, config);
    }

    async testJiraConnection(res) {
        try {
            const result = await this.jira.testConnection();
            this.sendSuccess(res, result);
        } catch (error) {
            this.sendError(res, 'Failed to test Jira connection: ' + error.message);
        }
    }
}

// Start the server
const server = new LocalStatusServer();
server.start();
