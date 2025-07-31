# Reddit GPT Summarizer API - Deployment Guide

## 🚀 Deploy to Render

### Prerequisites
1. GitHub account
2. Render account (free tier available)
3. Your API keys configured

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/reddit-gpt-summarizer.git
git push origin main
```

### Step 2: Deploy to Render

1. **Go to Render Dashboard**
   - Visit https://render.com
   - Sign up/Login with your GitHub account

2. **Create New Blueprint**
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**
   In the Render dashboard, set these environment variables:
   ```
   OPENAI_ORG_ID=your_openai_org_id
   OPENAI_API_KEY=your_openai_api_key
   REDDIT_CLIENT_ID=your_reddit_client_id
   REDDIT_CLIENT_SECRET=your_reddit_client_secret
   REDDIT_USERNAME=your_reddit_username
   REDDIT_PASSWORD=your_reddit_password
   REDDIT_USER_AGENT=linux:com.youragent.reddit-gpt-summarizer:v1.0.0 (by /u/yourusername)
   ANTHROPIC_API_KEY=your_anthropic_api_key (optional)
   ```

4. **Deploy**
   - Click "Apply" to start deployment
   - Wait for build to complete (usually 2-5 minutes)

### Step 3: Test Your API

Your API will be available at:
```
https://reddit-gpt-summarizer-api.onrender.com
```

**Test Endpoints:**
```bash
# Health check
curl https://reddit-gpt-summarizer-api.onrender.com/

# Summarize a Reddit post
curl "https://reddit-gpt-summarizer-api.onrender.com/summarize?url=https://www.reddit.com/r/dealsforindia/comments/1mdsuys/deals_on_25_phones_under_15000/&model=gpt-3.5-turbo&max_summaries=1"
```

## 🔧 Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Create New Web Service**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name:** `reddit-gpt-summarizer-api`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn simple_api:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables** (same as above)

## 📱 Chrome Extension Integration

Update your Chrome extension to use the Render URL:

```javascript
const apiUrl = 'https://reddit-gpt-summarizer-api.onrender.com/summarize';

async function summarizeRedditPost(url) {
    const params = new URLSearchParams({
        url: url,
        model: 'gpt-3.5-turbo',
        max_summaries: 1,
        chunk_length: 1000,
        max_tokens: 1500
    });
    
    try {
        const response = await fetch(`${apiUrl}?${params}`);
        const data = await response.json();
        
        if (data.success) {
            return data.summary;
        } else {
            throw new Error('Failed to generate summary');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

## 🔍 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that all dependencies are in `requirements.txt`
   - Ensure Python version is compatible

2. **API Returns 500 Error**
   - Check environment variables are set correctly
   - Verify API keys are valid

3. **CORS Issues**
   - The API already includes CORS middleware
   - If issues persist, check browser console for specific errors

4. **Rate Limiting**
   - Render free tier has limitations
   - Consider upgrading for production use

### Logs
- View logs in Render Dashboard → Your Service → Logs
- Check for any error messages during deployment

## 🎯 Benefits of Render Deployment

✅ **No ngrok warning pages**  
✅ **Always available**  
✅ **Professional URL**  
✅ **Automatic HTTPS**  
✅ **Easy scaling**  
✅ **Built-in monitoring**

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/summarize` | GET | Summarize Reddit post |
| `/health` | GET | Detailed health check |

## 🔐 Security Notes

- CORS is enabled for all origins (configure for production)
- No authentication currently implemented
- Consider adding API key authentication for production use
- Environment variables are encrypted in Render

---

**Your API will be live at:** `https://reddit-gpt-summarizer-api.onrender.com` 