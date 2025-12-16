#!/bin/bash
set -e

root="./vercel-output"

rm -rf "$root"
mkdir "$root"

echo "Building for Vercel..."

# Copy demo files to root
cp -r ./demo/* "$root/"

# Copy dist folder
cp -r ./dist "$root/dist"

# Fix paths in HTML files (change ../dist/ to ./dist/)
sed -i.bak 's|"\.\./dist/|"./dist/|g' "$root"/*.html
rm -f "$root"/*.html.bak

echo "Built for Vercel."

