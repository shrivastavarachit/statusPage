#!/bin/bash

echo "🚀 Starting Tekion IT Status Admin Dashboard..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check if Hugo is installed
if ! command -v hugo &> /dev/null; then
    echo "❌ Hugo is not installed. Please install Hugo first:"
    echo "   https://gohugo.io/installation/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ Hugo version: $(hugo version)"
echo ""

# Start the server
echo "🌟 Starting admin server on http://localhost:3001"
echo "📁 Managing content in: $(pwd)/../content/issues/"
echo ""
echo "🎯 Open your browser to: http://localhost:3001"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

node server.js
