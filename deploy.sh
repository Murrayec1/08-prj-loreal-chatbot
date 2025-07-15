#!/bin/bash

# GitHub Pages Deployment Script
# Run this after making changes to deploy to GitHub Pages

echo "🚀 Starting GitHub Pages deployment..."

# Add all changes
git add .

# Commit changes
echo "📝 Enter commit message:"
read commit_message
git commit -m "$commit_message"

# Push to main branch
echo "📤 Pushing to main branch..."
git push origin main

echo "✅ Deployment complete! Your site should be live in a few minutes."
echo "🔗 Check your GitHub repository's Actions tab for deployment status."
