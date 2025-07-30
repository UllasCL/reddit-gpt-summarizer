# Deploying Reddit GPT Summarizer to Render

This guide will help you deploy the Reddit GPT Summarizer to Render.

## Prerequisites

1. A Render account (free tier available)
2. API keys for the services you want to use:
   - OpenAI API key
   - Reddit API credentials
   - Anthropic API key (optional)

## Deployment Options

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add deployment files"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up or log in
   - Click "New +" and select "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**
   In the Render dashboard, add these environment variables:
   - `OPENAI_ORG_ID`: Your OpenAI organization ID
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `REDDIT_CLIENT_ID`: Your Reddit app client ID
   - `REDDIT_CLIENT_SECRET`: Your Reddit app client secret
   - `REDDIT_USERNAME`: Your Reddit username
   - `REDDIT_PASSWORD`: Your Reddit password
   - `ANTHROPIC_API_KEY`: Your Anthropic API key (optional)

4. **Deploy**
   - Render will automatically build and deploy your application
   - The app will be available at the provided URL

### Option 2: Manual Deployment

1. **Create a new Web Service**
   - Go to Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service**
   - **Name**: `reddit-gpt-summarizer`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `streamlit run app/main.py --server.port $PORT --server.address 0.0.0.0`

3. **Add Environment Variables**
   Same as Option 1

4. **Deploy**
   Click "Create Web Service"

## Environment Variables

Make sure to set these environment variables in your Render dashboard:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_ORG_ID` | Your OpenAI organization ID | Yes |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `REDDIT_CLIENT_ID` | Your Reddit app client ID | Yes |
| `REDDIT_CLIENT_SECRET` | Your Reddit app client secret | Yes |
| `REDDIT_USERNAME` | Your Reddit username | Yes |
| `REDDIT_PASSWORD` | Your Reddit password | Yes |
| `REDDIT_USER_AGENT` | Your Reddit user agent | No (has default) |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | No |

## Getting API Keys

### Reddit API
1. Go to https://www.reddit.com/prefs/apps
2. Create a new app (select "script")
3. Note down the client ID and secret

### OpenAI API
1. Go to https://platform.openai.com/api-keys
2. Create an API key
3. Get your organization ID from account settings

### Anthropic API (Optional)
1. Go to https://console.anthropic.com/
2. Create an API key

## Troubleshooting

### Common Issues

1. **Build fails**: Check that all dependencies are in `requirements.txt`
2. **App doesn't start**: Verify the start command is correct
3. **Environment variables not working**: Make sure they're set in Render dashboard
4. **Port issues**: The app uses port 8501 by default, Render will map it to their port

### Logs
- Check the logs in the Render dashboard for any errors
- The app creates logs in the `logs/` directory

## Cost Considerations

- Render free tier: 750 hours/month
- API calls to OpenAI/Anthropic will incur costs
- Consider usage limits and monitoring

## Security Notes

- Never commit API keys to your repository
- Use environment variables for all sensitive data
- Consider using Render's secret management features 