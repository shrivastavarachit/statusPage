#!/bin/bash

# Tekion IT Status Page - One-Click Deployment Script
# This script provides the simplest possible deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                 Tekion IT Status Page                        ║"
    echo "║                  One-Click Deployment                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

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

# Function to check if Docker is running
check_docker() {
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first:"
        echo "  curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if command_exists docker-compose; then
        DOCKER_COMPOSE_CMD="docker-compose"
    elif docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker compose"
    else
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    print_success "Docker Compose is available"
}

# Function to stop existing containers
stop_existing() {
    print_status "Stopping any existing containers..."
    
    if [ -f docker-compose.yml ]; then
        $DOCKER_COMPOSE_CMD down --remove-orphans 2>/dev/null || true
    fi
    
    # Stop any containers that might be running
    docker stop tekion-status-page 2>/dev/null || true
    docker rm tekion-status-page 2>/dev/null || true
    
    print_success "Cleaned up existing containers"
}

# Function to build and start the application
deploy_application() {
    print_status "Building and starting Tekion Status Page..."
    
    # Build the image
    print_status "Building Docker image..."
    $DOCKER_COMPOSE_CMD build --no-cache
    
    # Start the services
    print_status "Starting services..."
    $DOCKER_COMPOSE_CMD up -d
    
    print_success "Application started successfully"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            print_success "Services are ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_warning "Services may still be starting. Check logs with: $DOCKER_COMPOSE_CMD logs"
    return 1
}

# Function to show final instructions
show_success_message() {
    echo
    echo -e "${GREEN}🎉 Tekion IT Status Page deployed successfully!${NC}"
    echo
    echo "📍 Access URLs:"
    echo "   Status Page:     http://localhost"
    echo "   Admin Dashboard: http://localhost/admin"
    echo "   Direct Hugo:     http://localhost:1313"
    echo "   Direct Admin:    http://localhost:3001"
    echo
    echo "🔧 Management Commands:"
    echo "   View logs:       $DOCKER_COMPOSE_CMD logs -f"
    echo "   Stop services:   $DOCKER_COMPOSE_CMD down"
    echo "   Restart:         $DOCKER_COMPOSE_CMD restart"
    echo "   Update:          git pull && $DOCKER_COMPOSE_CMD build --no-cache && $DOCKER_COMPOSE_CMD up -d"
    echo
    echo "📊 Container Status:"
    $DOCKER_COMPOSE_CMD ps
    echo
    echo "🚀 Your status page is now running!"
    echo "   Create your first incident at: http://localhost/admin"
    echo
}

# Function to show help
show_help() {
    echo "Tekion IT Status Page - One-Click Deployment"
    echo
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --stop         Stop all services"
    echo "  --logs         Show service logs"
    echo "  --status       Show service status"
    echo "  --update       Update and restart services"
    echo
    echo "This script will:"
    echo "  1. Check Docker installation"
    echo "  2. Stop any existing containers"
    echo "  3. Build the application image"
    echo "  4. Start all services"
    echo "  5. Verify deployment"
    echo
}

# Main deployment function
main() {
    print_header
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Stop existing containers
    stop_existing
    
    # Deploy application
    deploy_application
    
    # Wait for services
    if wait_for_services; then
        show_success_message
    else
        print_warning "Deployment completed but services may still be starting."
        echo "Check logs with: $DOCKER_COMPOSE_CMD logs -f"
    fi
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --stop)
        print_status "Stopping all services..."
        check_docker_compose
        $DOCKER_COMPOSE_CMD down
        print_success "All services stopped"
        exit 0
        ;;
    --logs)
        check_docker_compose
        $DOCKER_COMPOSE_CMD logs -f
        exit 0
        ;;
    --status)
        check_docker_compose
        echo "Container Status:"
        $DOCKER_COMPOSE_CMD ps
        echo
        echo "Service Health:"
        curl -f http://localhost/health 2>/dev/null && echo "✅ Main service: OK" || echo "❌ Main service: Failed"
        curl -f http://localhost:1313 2>/dev/null && echo "✅ Hugo server: OK" || echo "❌ Hugo server: Failed"
        curl -f http://localhost:3001 2>/dev/null && echo "✅ Admin dashboard: OK" || echo "❌ Admin dashboard: Failed"
        exit 0
        ;;
    --update)
        print_status "Updating application..."
        check_docker_compose
        git pull
        $DOCKER_COMPOSE_CMD build --no-cache
        $DOCKER_COMPOSE_CMD up -d
        print_success "Application updated successfully"
        exit 0
        ;;
    "")
        # No arguments, run main deployment
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac
