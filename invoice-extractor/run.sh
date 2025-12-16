#!/bin/bash

# Invoice Extractor - Startup Script
# This script starts both the Flask backend and Next.js frontend servers

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

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        print_warning "Killing existing processes on port $port"
        kill -9 $pids 2>/dev/null || true
        sleep 1
    fi
}

# Function to cleanup on exit
cleanup() {
    print_warning "Shutting down servers..."
    kill_port 5001  # Flask backend
    kill_port 3000  # Next.js frontend
    print_success "Cleanup completed"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

print_status "🚀 Starting Invoice Extractor Application"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "backend/app.py" ] || [ ! -f "frontend/package.json" ]; then
    print_error "Please run this script from the invoice-extractor directory"
    print_error "Expected structure: backend/app.py and frontend/package.json"
    exit 1
fi

# Kill any existing processes on our ports
kill_port 5001
kill_port 3000

# Check Python virtual environment
print_status "Checking Python virtual environment..."
if [ ! -d "backend/venv" ]; then
    print_warning "Python virtual environment not found. Creating..."
    cd backend
    python -m venv venv
    if [ $? -ne 0 ]; then
        print_error "Failed to create Python virtual environment"
        print_error "Please ensure Python 3.8+ is installed"
        exit 1
    fi
    source venv/bin/activate
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        print_error "Failed to install Python dependencies"
        exit 1
    fi
    cd ..
    print_success "Python virtual environment created and dependencies installed"
fi

# Check Node.js dependencies
print_status "Checking Node.js dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    print_warning "Node.js dependencies not found. Installing..."
    cd frontend
    npm install
    cd ..
    print_success "Node.js dependencies installed"
fi

# Start Flask backend
print_status "Starting Flask backend server (port 5001)..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! check_port 5001; then
    print_error "Failed to start Flask backend on port 5001"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

print_success "Flask backend started successfully (PID: $BACKEND_PID)"

# Start Next.js frontend
print_status "Starting Next.js frontend server (port 3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ! check_port 3000; then
    print_error "Failed to start Next.js frontend on port 3000"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

print_success "Next.js frontend started successfully (PID: $FRONTEND_PID)"

echo "=================================================="
print_success "🎉 Invoice Extractor is now running!"
echo ""
print_status "📱 Frontend (Next.js):  http://localhost:3000"
print_status "🔧 Backend (Flask):     http://localhost:5001"
print_status "📚 API Documentation:   http://localhost:5001/api-docs/"
echo ""
print_status "💡 Features available:"
echo "   • Upload and process invoices"
echo "   • View processing history with delete functionality"
echo "   • Explore database (products created dynamically)"
echo "   • Interactive API documentation"
echo ""
print_warning "Press Ctrl+C to stop both servers"
echo "=================================================="

# Keep the script running and wait for user interrupt
wait
