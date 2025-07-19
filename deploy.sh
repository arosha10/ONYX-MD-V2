#!/bin/bash

echo "🚀 Starting ONYX MD Bot deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create auth directory if it doesn't exist
if [ ! -d "auth_info_baileys" ]; then
    echo "📁 Creating auth directory..."
    mkdir -p auth_info_baileys
fi

# Check if session ID is provided
if [ -z "$SESSION_ID" ]; then
    echo "⚠️  Warning: SESSION_ID environment variable is not set"
    echo "   Please set it in your Railway environment variables"
fi

# Check if owner number is provided
if [ -z "$OWNER_NUM" ]; then
    echo "⚠️  Warning: OWNER_NUM environment variable is not set"
    echo "   Please set it in your Railway environment variables"
fi

echo "🎯 Starting the bot..."
npm start 