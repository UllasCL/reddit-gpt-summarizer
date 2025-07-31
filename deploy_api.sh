#!/bin/bash

echo "🚀 Deploying Reddit GPT Summarizer API to Render..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote repository found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/reddit-gpt-summarizer.git"
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy API to Render"
git push origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "🌐 Now deploy to Render:"
echo "1. Go to https://render.com"
echo "2. Click 'New' → 'Blueprint'"
echo "3. Connect your GitHub repository"
echo "4. Render will automatically detect the render.yaml file"
echo "5. Set your environment variables:"
echo "   - OPENAI_ORG_ID"
echo "   - OPENAI_API_KEY"
echo "   - REDDIT_CLIENT_ID"
echo "   - REDDIT_CLIENT_SECRET"
echo "   - REDDIT_USERNAME"
echo "   - REDDIT_PASSWORD"
echo "   - ANTHROPIC_API_KEY (optional)"
echo ""
echo "🎯 Your API will be available at: https://reddit-gpt-summarizer-api.onrender.com" 