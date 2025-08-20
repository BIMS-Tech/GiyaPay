#!/bin/bash

# Script to fix \1 characters in HTML files
echo "Fixing \1 characters in HTML files..."

# Find all HTML files and remove \1 characters (macOS compatible)
find . -name "*.html" -type f -exec sed -i '' 's/\\1//g' {} \;

echo "Done! All \1 characters have been removed from HTML files."
