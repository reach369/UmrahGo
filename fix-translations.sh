#!/bin/bash

echo "🔧 Fixing translation issues..."

# Kill any running Next.js server
echo "Stopping any running Next.js servers..."
pkill -f "next"

# Clear Next.js cache thoroughly
echo "Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Create message directory symlinks for better path resolution
echo "Creating messages symlinks..."
ln -sf src/messages messages

# Ensure correct next-intl configuration
echo "Cleaning npm cache..."
npm cache clean --force

echo "Reinstalling dependencies..."
npm install

echo "🚀 Done! Now restart your development server with:"
echo ""
echo "  npm run dev"
echo ""
echo "If you're still experiencing issues, try these additional steps:"
echo ""
echo "1. Clear your browser cache or use incognito mode"
echo "2. Run a clean build: npm run build && npm run start"
echo "3. Try updating next-intl: npm install next-intl@latest"
echo "4. Check browser console for any remaining errors" 