# Reddit GPT Summarizer API Documentation

## Overview
This API provides a simple GET endpoint to summarize Reddit posts using GPT models. It's designed for easy integration with Chrome extensions.

## Base URL
```
http://localhost:8000
```

## Endpoints

### 1. Health Check
**GET** `/`

Returns the API status and version information.

**Response:**
```json
{
  "message": "Reddit GPT Summarizer API",
  "version": "1.0.0",
  "status": "healthy"
}
```

### 2. Summarize Reddit Post
**GET** `/summarize`

Summarizes a Reddit post and its comments using GPT models.

**Parameters:**
- `url` (required): Reddit URL to summarize
- `model` (optional): LLM model to use (default: "gpt-3.5-turbo")
- `max_summaries` (optional): Maximum number of summaries to generate (default: 3)
- `chunk_length` (optional): Token length for each chunk (default: 1000)
- `max_tokens` (optional): Maximum tokens per summary (default: 1500)

**Example Request:**
```
GET /summarize?url=https://www.reddit.com/r/mildlyinfuriating/comments/1mdp51h/someone_has_access_to_my_phones_screen/&model=gpt-3.5-turbo&max_summaries=2
```

**Response:**
```json
{
  "success": true,
  "summary": "Generated summary text...",
  "original_title": "Someone has access to my phone's screen",
  "subreddit": "mildlyinfuriating",
  "processing_time": 2.5,
  "url": "https://www.reddit.com/r/mildlyinfuriating/comments/1mdp51h/someone_has_access_to_my_phones_screen/",
  "model": "gpt-3.5-turbo"
}
```

## Chrome Extension Integration

### Example JavaScript Usage
```javascript
async function summarizeRedditPost(url) {
    const apiUrl = 'http://localhost:8000/summarize';
    const params = new URLSearchParams({
        url: url,
        model: 'gpt-3.5-turbo',
        max_summaries: 2,
        chunk_length: 1000,
        max_tokens: 1000
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

// Usage
const redditUrl = 'https://www.reddit.com/r/subreddit/comments/123/post_title/';
summarizeRedditPost(redditUrl)
    .then(summary => {
        console.log('Summary:', summary);
    })
    .catch(error => {
        console.error('Error:', error);
    });
```

### Chrome Extension Manifest
```json
{
  "manifest_version": 3,
  "name": "Reddit Summarizer",
  "version": "1.0",
  "permissions": [
    "activeTab",
    "storage"
  ],
  "host_permissions": [
    "http://localhost:8000/*",
    "https://reddit.com/*",
    "https://www.reddit.com/*"
  ],
  "content_scripts": [
    {
      "matches": ["https://reddit.com/*", "https://www.reddit.com/*"],
      "js": ["content.js"]
    }
  ]
}
```

## Running the API

### Local Development
```bash
# Install dependencies
pip3 install -r requirements.txt

# Run the API server
python3 run_api.py
```

The API will be available at `http://localhost:8000`

### Test the API
```bash
# Test health endpoint
curl http://localhost:8000/

# Test summarize endpoint
curl "http://localhost:8000/summarize?url=https://www.reddit.com/r/mildlyinfuriating/comments/1mdp51h/someone_has_access_to_my_phones_screen/&model=gpt-3.5-turbo&max_summaries=2"
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "detail": "Invalid Reddit URL"
}
```

**404 Not Found:**
```json
{
  "detail": "Could not fetch Reddit data"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error: [error message]"
}
```

## Rate Limiting
Currently, no rate limiting is implemented. For production use, consider adding rate limiting to prevent abuse.

## Security Notes
- CORS is enabled for all origins (configure properly for production)
- No authentication is currently implemented
- Consider adding API key authentication for production use 