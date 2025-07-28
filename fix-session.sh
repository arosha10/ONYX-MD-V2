#!/bin/bash

echo "🔄 Fixing ONYX MD Bot Session..."

# Remove old session files
echo "🗑️ Removing old session files..."
rm -rf auth_info_baileys/

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Generate new session
echo "📱 Generating new WhatsApp session..."
echo "Please scan the QR code that appears below with your WhatsApp mobile app."
echo ""

node generate-session.js

echo ""
echo "✅ Session generation complete!"
echo "🚀 Starting the bot..."
npm start 