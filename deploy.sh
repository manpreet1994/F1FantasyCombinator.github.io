#!/bin/bash

# This script automates the deployment process.
# It resets the main index.html from a backup and copies the built assets from the /dist directory.

# Exit script on any error
set -e

echo "🚀 Starting deployment process..."

# 1. Remove the current index.html file
echo "   - Removing current index.html..."
rm -f index.html
rm -rf assets/
rm -rf dist/

# 2. Copy index_backup.html to create a new index.html
echo "   - Restoring index.html from backup..."
cp index_backup.html index.html

# 2.1 Build the project to generate the dist/ directory
echo "   - Building the project..."
npm run build

# 3. Copy all files from the dist/ directory to the project root
echo "   - Copying built assets from dist/ to root..."
cp -r dist/* .

echo "✅ Deployment finished successfully!"
