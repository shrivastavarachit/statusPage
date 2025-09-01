<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Configuration
$CONTENT_DIR = '../content/issues/';
$HUGO_COMMAND = 'cd .. && hugo --destination public';

class StatusAPI {
    private $contentDir;
    
    public function __construct($contentDir) {
        $this->contentDir = $contentDir;
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = $_GET['path'] ?? '';
        
        switch ($method) {
            case 'GET':
                return $this->handleGet($path);
            case 'POST':
                return $this->handlePost($path);
            case 'PUT':
                return $this->handlePut($path);
            case 'DELETE':
                return $this->handleDelete($path);
            default:
                return $this->error('Method not allowed', 405);
        }
    }
    
    private function handleGet($path) {
        switch ($path) {
            case 'incidents':
                return $this->getIncidents();
            case 'services':
                return $this->getServices();
            default:
                return $this->error('Not found', 404);
        }
    }
    
    private function handlePost($path) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        switch ($path) {
            case 'incidents':
                return $this->createIncident($data);
            case 'services/update':
                return $this->updateServiceStatus($data);
            default:
                return $this->error('Not found', 404);
        }
    }
    
    private function handlePut($path) {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (strpos($path, 'incidents/') === 0) {
            $id = substr($path, 10);
            return $this->updateIncident($id, $data);
        }
        
        return $this->error('Not found', 404);
    }
    
    private function handleDelete($path) {
        if (strpos($path, 'incidents/') === 0) {
            $id = substr($path, 10);
            return $this->deleteIncident($id);
        }
        
        return $this->error('Not found', 404);
    }
    
    private function getIncidents() {
        $incidents = [];
        $files = glob($this->contentDir . '*.md');
        
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $incident = $this->parseMarkdownFile($content, basename($file));
            if ($incident) {
                $incidents[] = $incident;
            }
        }
        
        return $this->success($incidents);
    }
    
    private function getServices() {
        // Read from config or return hardcoded services
        $services = [
            ['name' => 'Bangalore ISP Tata Comms', 'status' => 'operational'],
            ['name' => 'Bangalore ISP Tata Tele', 'status' => 'operational'],
            ['name' => 'Bangalore ISP Airtel', 'status' => 'operational'],
            ['name' => 'Corp VPN', 'status' => 'operational'],
            ['name' => 'API', 'status' => 'operational'],
            ['name' => 'Media Proxy', 'status' => 'operational']
        ];
        
        return $this->success($services);
    }
    
    private function createIncident($data) {
        $title = $data['title'] ?? '';
        $severity = $data['severity'] ?? 'notice';
        $description = $data['description'] ?? '';
        $affected = $data['affected'] ?? [];
        
        if (empty($title) || empty($description)) {
            return $this->error('Title and description are required');
        }
        
        $date = date('Y-m-d H:i:s');
        $filename = date('Y-m-d') . '-' . $this->slugify($title) . '.md';
        $filepath = $this->contentDir . $filename;
        
        $frontMatter = "---\n";
        $frontMatter .= "title: " . $title . "\n";
        $frontMatter .= "date: " . date('c') . "\n";
        $frontMatter .= "resolved: false\n";
        $frontMatter .= "severity: " . $severity . "\n";
        
        if (!empty($affected)) {
            $frontMatter .= "affected:\n";
            foreach ($affected as $service) {
                $frontMatter .= "  - " . $service . "\n";
            }
        }
        
        $frontMatter .= "section: issue\n";
        $frontMatter .= "---\n\n";
        $frontMatter .= "*Investigating* - " . $description;
        
        if (file_put_contents($filepath, $frontMatter)) {
            $this->rebuildSite();
            return $this->success(['message' => 'Incident created', 'filename' => $filename]);
        }
        
        return $this->error('Failed to create incident');
    }
    
    private function updateIncident($filename, $data) {
        $filepath = $this->contentDir . $filename;
        
        if (!file_exists($filepath)) {
            return $this->error('Incident not found', 404);
        }
        
        $content = file_get_contents($filepath);
        $parsed = $this->parseMarkdownFile($content, $filename);
        
        if (!$parsed) {
            return $this->error('Failed to parse incident file');
        }
        
        // Update fields
        if (isset($data['resolved'])) {
            $parsed['frontMatter']['resolved'] = $data['resolved'];
            if ($data['resolved']) {
                $parsed['frontMatter']['resolvedWhen'] = date('c');
            }
        }
        
        if (isset($data['update'])) {
            $parsed['content'] = $data['update'] . "\n\n" . $parsed['content'];
        }
        
        $newContent = $this->buildMarkdownFile($parsed['frontMatter'], $parsed['content']);
        
        if (file_put_contents($filepath, $newContent)) {
            $this->rebuildSite();
            return $this->success(['message' => 'Incident updated']);
        }
        
        return $this->error('Failed to update incident');
    }
    
    private function deleteIncident($filename) {
        $filepath = $this->contentDir . $filename;
        
        if (!file_exists($filepath)) {
            return $this->error('Incident not found', 404);
        }
        
        if (unlink($filepath)) {
            $this->rebuildSite();
            return $this->success(['message' => 'Incident deleted']);
        }
        
        return $this->error('Failed to delete incident');
    }
    
    private function updateServiceStatus($data) {
        $serviceName = $data['service'] ?? '';
        $status = $data['status'] ?? '';
        
        if (empty($serviceName) || empty($status)) {
            return $this->error('Service name and status are required');
        }
        
        // For now, just return success
        // In a full implementation, you'd update service status in config or database
        $this->rebuildSite();
        return $this->success(['message' => 'Service status updated']);
    }
    
    private function parseMarkdownFile($content, $filename) {
        // Split front matter and content
        if (!preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)$/s', $content, $matches)) {
            return null;
        }
        
        $frontMatterText = $matches[1];
        $contentText = trim($matches[2]);
        
        // Parse YAML front matter (simple implementation)
        $frontMatter = [];
        $lines = explode("\n", $frontMatterText);
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            if (strpos($line, ':') !== false) {
                list($key, $value) = explode(':', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Handle arrays (affected services)
                if ($key === 'affected' && $value === '') {
                    $frontMatter[$key] = [];
                } elseif (strpos($line, '  - ') === 0) {
                    $frontMatter['affected'][] = trim(substr($line, 4));
                } else {
                    $frontMatter[$key] = $value;
                }
            }
        }
        
        return [
            'filename' => $filename,
            'frontMatter' => $frontMatter,
            'content' => $contentText
        ];
    }
    
    private function buildMarkdownFile($frontMatter, $content) {
        $output = "---\n";
        
        foreach ($frontMatter as $key => $value) {
            if (is_array($value)) {
                $output .= $key . ":\n";
                foreach ($value as $item) {
                    $output .= "  - " . $item . "\n";
                }
            } else {
                $output .= $key . ": " . $value . "\n";
            }
        }
        
        $output .= "---\n\n";
        $output .= $content;
        
        return $output;
    }
    
    private function rebuildSite() {
        global $HUGO_COMMAND;
        
        // Execute Hugo build command
        exec($HUGO_COMMAND . ' 2>&1', $output, $returnCode);
        
        if ($returnCode === 0) {
            error_log('Hugo site rebuilt successfully');
        } else {
            error_log('Hugo rebuild failed: ' . implode("\n", $output));
        }
    }
    
    private function slugify($text) {
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);
        $text = trim($text, '-');
        return $text;
    }
    
    private function success($data = null) {
        return json_encode(['success' => true, 'data' => $data]);
    }
    
    private function error($message, $code = 400) {
        http_response_code($code);
        return json_encode(['success' => false, 'error' => $message]);
    }
}

// Handle the request
$api = new StatusAPI($CONTENT_DIR);
echo $api->handleRequest();
?>
