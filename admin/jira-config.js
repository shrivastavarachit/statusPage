// Jira Configuration for Tekion IT Status Page
// Configure your Jira instance details here

const JIRA_CONFIG = {
    // Jira instance URL (replace with your Jira URL)
    baseURL: process.env.JIRA_BASE_URL || 'https://your-company.atlassian.net',
    
    // Authentication (use API token for cloud, password for server)
    auth: {
        email: process.env.JIRA_EMAIL || 'your-email@company.com',
        apiToken: process.env.JIRA_API_TOKEN || 'your-api-token-here'
    },
    
    // Project configuration
    project: {
        key: process.env.JIRA_PROJECT_KEY || 'IT', // Your Jira project key
        issueType: process.env.JIRA_ISSUE_TYPE || 'Incident' // Issue type for incidents
    },
    
    // Field mappings
    fields: {
        // Standard fields
        summary: 'summary',
        description: 'description',
        priority: 'priority',
        
        // Custom fields (replace with your actual field IDs)
        severity: process.env.JIRA_SEVERITY_FIELD || 'customfield_10001',
        affectedServices: process.env.JIRA_AFFECTED_SERVICES_FIELD || 'customfield_10002',
        statusPageLink: process.env.JIRA_STATUS_PAGE_FIELD || 'customfield_10003'
    },
    
    // Priority mapping (Status Page severity -> Jira priority)
    priorityMapping: {
        'down': 'Highest',
        'disrupted': 'High', 
        'notice': 'Medium'
    },
    
    // Labels to add to Jira tickets
    labels: ['status-page', 'infrastructure', 'incident'],
    
    // Components (if your project uses components)
    components: [
        { name: 'Infrastructure' }
    ]
};

module.exports = JIRA_CONFIG;
