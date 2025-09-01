#!/bin/bash

# Tekion IT Status Page - Quick Setup Script
# This script automates the deployment process for the status page

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command_exists apt; then
            OS="ubuntu"
        elif command_exists yum; then
            OS="centos"
        else
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        OS="unknown"
    fi
}

# Function to install Docker
install_docker() {
    print_status "Installing Docker..."
    
    if command_exists docker; then
        print_success "Docker is already installed"
        return
    fi
    
    case $OS in
        ubuntu)
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            rm get-docker.sh
            ;;
        centos)
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce docker-ce-cli containerd.io
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker $USER
            ;;
        macos)
            print_warning "Please install Docker Desktop for Mac from https://docker.com/products/docker-desktop"
            exit 1
            ;;
        *)
            print_error "Unsupported OS for automatic Docker installation"
            exit 1
            ;;
    esac
    
    print_success "Docker installed successfully"
}

# Function to install Docker Compose
install_docker_compose() {
    print_status "Installing Docker Compose..."
    
    if command_exists docker-compose; then
        print_success "Docker Compose is already installed"
        return
    fi
    
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose installed successfully"
}

# Function to setup firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    if command_exists ufw; then
        sudo ufw --force reset
        sudo ufw default deny incoming
        sudo ufw default allow outgoing
        sudo ufw allow ssh
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        sudo ufw allow 1313/tcp
        sudo ufw allow 3001/tcp
        sudo ufw --force enable
        print_success "UFW firewall configured"
    elif command_exists firewall-cmd; then
        sudo firewall-cmd --permanent --add-port=80/tcp
        sudo firewall-cmd --permanent --add-port=443/tcp
        sudo firewall-cmd --permanent --add-port=1313/tcp
        sudo firewall-cmd --permanent --add-port=3001/tcp
        sudo firewall-cmd --reload
        print_success "Firewalld configured"
    else
        print_warning "No supported firewall found. Please configure manually."
    fi
}

# Function to clone repository
clone_repository() {
    print_status "Cloning repository..."
    
    if [ -d "statusPage" ]; then
        print_warning "Directory 'statusPage' already exists. Updating..."
        cd statusPage
        git pull
        cd ..
    else
        git clone https://github.com/shrivastavarachit/statusPage.git
    fi
    
    print_success "Repository cloned/updated successfully"
}

# Function to deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker Compose..."
    
    cd statusPage
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cat > .env << EOF
HUGO_ENV=production
NODE_ENV=production
HUGO_BASEURL=http://localhost:1313
ADMIN_PORT=3001
EOF
        print_status "Created .env file with default settings"
    fi
    
    # Start services
    docker-compose up -d
    
    print_success "Services started successfully"
    cd ..
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    sleep 10  # Wait for services to start
    
    # Check status page
    if curl -f http://localhost:1313 >/dev/null 2>&1; then
        print_success "Status page is accessible at http://localhost:1313"
    else
        print_error "Status page is not accessible"
        return 1
    fi
    
    # Check admin dashboard
    if curl -f http://localhost:3001 >/dev/null 2>&1; then
        print_success "Admin dashboard is accessible at http://localhost:3001"
    else
        print_error "Admin dashboard is not accessible"
        return 1
    fi
    
    print_success "All services are running correctly!"
}

# Function to show final instructions
show_instructions() {
    echo
    echo "🎉 Tekion IT Status Page deployed successfully!"
    echo
    echo "📍 Access URLs:"
    echo "   Status Page:     http://localhost:1313"
    echo "   Admin Dashboard: http://localhost:3001"
    echo
    echo "🔧 Management Commands:"
    echo "   View logs:       cd statusPage && docker-compose logs -f"
    echo "   Stop services:   cd statusPage && docker-compose down"
    echo "   Start services:  cd statusPage && docker-compose up -d"
    echo "   Update:          cd statusPage && git pull && docker-compose build --no-cache && docker-compose up -d"
    echo
    echo "📚 Documentation:"
    echo "   VM Deployment:   https://github.com/shrivastavarachit/statusPage/blob/main/VM-DEPLOYMENT-GUIDE.md"
    echo "   Docker Guide:    https://github.com/shrivastavarachit/statusPage/blob/main/DOCKER-DEPLOYMENT.md"
    echo "   Admin Guide:     https://github.com/shrivastavarachit/statusPage/blob/main/ADMIN-GUIDE.md"
    echo
    echo "🔒 Security Notes:"
    echo "   - Admin dashboard is accessible on port 3001"
    echo "   - Consider restricting admin access to internal networks"
    echo "   - Setup SSL/TLS for production use"
    echo
}

# Main execution
main() {
    echo "🚀 Tekion IT Status Page - Quick Setup"
    echo "======================================"
    echo
    
    # Detect OS
    detect_os
    print_status "Detected OS: $OS"
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Please don't run this script as root"
        exit 1
    fi
    
    # Check for git
    if ! command_exists git; then
        print_error "Git is required but not installed. Please install git first."
        exit 1
    fi
    
    # Check for curl
    if ! command_exists curl; then
        print_error "Curl is required but not installed. Please install curl first."
        exit 1
    fi
    
    # Install Docker and Docker Compose
    install_docker
    install_docker_compose
    
    # Setup firewall
    setup_firewall
    
    # Clone repository
    clone_repository
    
    # Deploy with Docker
    deploy_docker
    
    # Verify deployment
    if verify_deployment; then
        show_instructions
    else
        print_error "Deployment verification failed. Check logs for details."
        echo "Debug commands:"
        echo "  cd statusPage && docker-compose logs"
        echo "  docker-compose ps"
        exit 1
    fi
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "Tekion IT Status Page - Quick Setup Script"
        echo
        echo "Usage: $0 [options]"
        echo
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --docker-only  Only install Docker and Docker Compose"
        echo "  --no-firewall  Skip firewall configuration"
        echo
        echo "This script will:"
        echo "  1. Install Docker and Docker Compose"
        echo "  2. Configure firewall (UFW/firewalld)"
        echo "  3. Clone the status page repository"
        echo "  4. Deploy using Docker Compose"
        echo "  5. Verify the deployment"
        echo
        exit 0
        ;;
    --docker-only)
        detect_os
        install_docker
        install_docker_compose
        print_success "Docker and Docker Compose installed successfully"
        exit 0
        ;;
    --no-firewall)
        SKIP_FIREWALL=true
        ;;
esac

# Run main function
main

print_success "Setup completed successfully! 🎉"
