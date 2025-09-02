const axios = require('axios');
const JIRA_CONFIG = require('./jira-config');

class JiraIntegration {
    constructor() {
        this.config = JIRA_CONFIG;
        this.enabled = this.isConfigured();
        
        if (this.enabled) {
            this.client = axios.create({
                baseURL: this.config.baseURL,
                auth: {
                    username: this.config.auth.email,
                    password: this.config.auth.apiToken
                },
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Jira integration enabled');
        } else {
            console.log('⚠️  Jira integration disabled - check configuration');
        }
    }

    isConfigured() {
        return this.config.baseURL !== 'https://your-company.atlassian.net' &&
               this.config.auth.email !== 'your-email@company.com' &&
               this.config.auth.apiToken !== 'your-api-token-here';
    }

    async createTicket(incidentData) {
        if (!this.enabled) {
            console.log('Jira integration disabled, skipping ticket creation');
            return null;
        }

        try {
            const { title, severity, description, affected } = incidentData;
            
            // Build Jira ticket payload
            const ticketData = {
                fields: {
                    project: {
                        key: this.config.project.key
                    },
                    summary: `[Status Page] ${title}`,
                    description: this.formatDescription(description, affected, severity),
                    issuetype: {
                        name: this.config.project.issueType
                    },
                    priority: {
                        name: this.config.priorityMapping[severity] || 'Medium'
                    },
                    labels: [...this.config.labels]
                }
            };

            // Add components if configured
            if (this.config.components && this.config.components.length > 0) {
                ticketData.fields.components = this.config.components;
            }

            // Add custom fields if configured
            if (this.config.fields.severity && this.config.fields.severity.startsWith('customfield_')) {
                ticketData.fields[this.config.fields.severity] = severity;
            }

            if (this.config.fields.affectedServices && this.config.fields.affectedServices.startsWith('customfield_')) {
                ticketData.fields[this.config.fields.affectedServices] = affected ? affected.join(', ') : '';
            }

            if (this.config.fields.statusPageLink && this.config.fields.statusPageLink.startsWith('customfield_')) {
                ticketData.fields[this.config.fields.statusPageLink] = 'http://localhost:1313';
            }

            console.log('Creating Jira ticket:', JSON.stringify(ticketData, null, 2));

            const response = await this.client.post('/rest/api/3/issue', ticketData);
            
            const ticket = {
                key: response.data.key,
                id: response.data.id,
                url: `${this.config.baseURL}/browse/${response.data.key}`
            };

            console.log(`✅ Jira ticket created: ${ticket.key} - ${ticket.url}`);
            return ticket;

        } catch (error) {
            console.error('❌ Failed to create Jira ticket:', error.response?.data || error.message);
            
            // Return error details for user feedback
            return {
                error: true,
                message: error.response?.data?.errorMessages?.[0] || error.message,
                details: error.response?.data
            };
        }
    }

    async updateTicket(ticketKey, updateData) {
        if (!this.enabled || !ticketKey) {
            return null;
        }

        try {
            const { status, comment } = updateData;
            
            // Add comment to ticket
            if (comment) {
                await this.client.post(`/rest/api/3/issue/${ticketKey}/comment`, {
                    body: {
                        type: "doc",
                        version: 1,
                        content: [
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: `Status Page Update: ${comment}`
                                    }
                                ]
                            }
                        ]
                    }
                });
            }

            // Update ticket status if resolved
            if (status === 'resolved') {
                // Get available transitions
                const transitionsResponse = await this.client.get(`/rest/api/3/issue/${ticketKey}/transitions`);
                const transitions = transitionsResponse.data.transitions;
                
                // Find "Done" or "Resolved" transition
                const resolveTransition = transitions.find(t => 
                    t.name.toLowerCase().includes('done') || 
                    t.name.toLowerCase().includes('resolved') ||
                    t.name.toLowerCase().includes('close')
                );

                if (resolveTransition) {
                    await this.client.post(`/rest/api/3/issue/${ticketKey}/transitions`, {
                        transition: {
                            id: resolveTransition.id
                        }
                    });
                    console.log(`✅ Jira ticket ${ticketKey} marked as resolved`);
                }
            }

            return { success: true };

        } catch (error) {
            console.error(`❌ Failed to update Jira ticket ${ticketKey}:`, error.response?.data || error.message);
            return {
                error: true,
                message: error.response?.data?.errorMessages?.[0] || error.message
            };
        }
    }

    formatDescription(description, affected, severity) {
        let formattedDescription = `*Incident Report from Status Page*\n\n`;
        formattedDescription += `*Severity:* ${severity.toUpperCase()}\n\n`;
        
        if (affected && affected.length > 0) {
            formattedDescription += `*Affected Services:*\n`;
            affected.forEach(service => {
                formattedDescription += `• ${service}\n`;
            });
            formattedDescription += `\n`;
        }
        
        formattedDescription += `*Description:*\n${description}\n\n`;
        formattedDescription += `*Status Page:* http://localhost:1313\n`;
        formattedDescription += `*Admin Dashboard:* http://localhost:3001\n\n`;
        formattedDescription += `This ticket was automatically created from the IT Status Page incident management system.`;
        
        return formattedDescription;
    }

    async testConnection() {
        if (!this.enabled) {
            return { success: false, message: 'Jira integration not configured' };
        }

        try {
            const response = await this.client.get('/rest/api/3/myself');
            return { 
                success: true, 
                message: `Connected to Jira as ${response.data.displayName}`,
                user: response.data
            };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.errorMessages?.[0] || error.message 
            };
        }
    }

    getConfig() {
        return {
            enabled: this.enabled,
            baseURL: this.config.baseURL,
            project: this.config.project.key,
            issueType: this.config.project.issueType
        };
    }
}

module.exports = JiraIntegration;
