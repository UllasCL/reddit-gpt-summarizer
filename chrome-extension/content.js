// Content script for Reddit GPT Summarizer
// This script uses Reddit API and OpenAI API directly from the browser

class RedditAnalyzer {
    constructor() {
        this.openaiApiKey = null;
        this.redditClientId = null;
        this.redditClientSecret = null;
        this.redditUserAgent = 'RedditAnalyzer/1.0.0';
        this.extensionDetected = false;
        this.popupShown = false;
    }

    // Set API keys from popup
    setApiKeys(openaiKey, redditClientId, redditClientSecret) {
        this.openaiApiKey = openaiKey;
        this.redditClientId = redditClientId;
        this.redditClientSecret = redditClientSecret;
    }

    // Detect if we're on a Reddit post page
    isRedditPostPage() {
        const url = window.location.href;
        console.log('Checking URL:', url);
        
        // Check for Reddit domain
        const isReddit = url.includes('reddit.com') || url.includes('www.reddit.com');
        
        // Check for post patterns
        const hasComments = url.includes('/comments/');
        const hasPostId = url.match(/\/comments\/[a-zA-Z0-9]+/);
        
        console.log('Reddit detection:', { isReddit, hasComments, hasPostId: !!hasPostId });
        
        return isReddit && hasComments && hasPostId;
    }

    // Test function to manually show popup
    testShowPopup() {
        console.log('Manual test: showing popup');
        this.popupShown = false; // Reset for testing
        this.showExtensionPopup();
    }

    // Show extension notification popup
    showExtensionPopup() {
        console.log('Attempting to show popup...');
        
        // Check if popup already exists
        if (document.getElementById('reddit-gpt-extension-popup')) {
            console.log('Popup already exists, skipping...');
            return;
        }

        // Check if we've already shown popup on this page
        if (this.popupShown) {
            console.log('Popup already shown on this page, skipping...');
            return;
        }

        console.log('Creating popup...');

        // Create popup element
        const popup = document.createElement('div');
        popup.id = 'reddit-gpt-extension-popup';
        popup.innerHTML = `
            <div class="reddit-gpt-popup-content">
                <div class="reddit-gpt-popup-header">
                    <span class="reddit-gpt-popup-icon">🤖</span>
                    <span class="reddit-gpt-popup-title">Reddit GPT Summarizer</span>
                    <button class="reddit-gpt-popup-close" id="reddit-gpt-popup-close">×</button>
                </div>
                <div class="reddit-gpt-popup-body">
                    <p>📊 <strong>Analyze this Reddit post with AI!</strong></p>
                    <p>Get intelligent summaries of posts and comments using GPT models.</p>
                    <div class="reddit-gpt-popup-actions">
                        <button class="reddit-gpt-popup-btn primary" id="reddit-gpt-popup-try-now">
                            🚀 Try Now
                        </button>
                        <button class="reddit-gpt-popup-btn secondary" id="reddit-gpt-popup-maybe-later">
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #reddit-gpt-extension-popup {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 320px;
                animation: slideIn 0.3s ease-out;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .reddit-gpt-popup-content {
                padding: 16px;
            }

            .reddit-gpt-popup-header {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                gap: 8px;
            }

            .reddit-gpt-popup-icon {
                font-size: 20px;
            }

            .reddit-gpt-popup-title {
                font-weight: 600;
                font-size: 14px;
                flex-grow: 1;
            }

            .reddit-gpt-popup-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }

            .reddit-gpt-popup-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .reddit-gpt-popup-body p {
                margin: 0 0 8px 0;
                font-size: 12px;
                line-height: 1.4;
            }

            .reddit-gpt-popup-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }

            .reddit-gpt-popup-btn {
                flex: 1;
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                min-height: 32px;
            }

            .reddit-gpt-popup-btn.primary {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }

            .reddit-gpt-popup-btn.primary:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-1px);
            }

            .reddit-gpt-popup-btn.secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }

            .reddit-gpt-popup-btn.secondary:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            @media (max-width: 768px) {
                #reddit-gpt-extension-popup {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;

        // Add to page
        document.head.appendChild(style);
        document.body.appendChild(popup);

        console.log('Popup added to page');

        // Add event listeners for buttons
        const closeBtn = document.getElementById('reddit-gpt-popup-close');
        const tryNowBtn = document.getElementById('reddit-gpt-popup-try-now');
        const maybeLaterBtn = document.getElementById('reddit-gpt-popup-maybe-later');

        // Close button functionality
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('Close button clicked');
                popup.remove();
            });
        }

        // Try Now button functionality
        if (tryNowBtn) {
            tryNowBtn.addEventListener('click', () => {
                console.log('Try Now button clicked');
                popup.remove();
                // Send message to open extension popup
                chrome.runtime.sendMessage({ action: 'openExtensionPopup' });
            });
        }

        // Maybe Later button functionality
        if (maybeLaterBtn) {
            maybeLaterBtn.addEventListener('click', () => {
                console.log('Maybe Later button clicked');
                popup.remove();
            });
        }

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (popup.parentElement) {
                popup.remove();
                console.log('Popup auto-removed');
            }
        }, 10000);

        // Mark as shown
        this.popupShown = true;
        this.extensionDetected = true;
    }

    // Check if extension is installed and configured
    async checkExtensionStatus() {
        try {
            console.log('Checking extension status...');
            const response = await chrome.runtime.sendMessage({ action: 'checkStatus' });
            console.log('Extension status response:', response);
            return response && response.configured;
        } catch (error) {
            console.error('Error checking extension status:', error);
            return false;
        }
    }

    // Initialize post detection
    async initPostDetection() {
        console.log('Initializing post detection...');
        
        if (!this.isRedditPostPage()) {
            console.log('Not a Reddit post page, skipping...');
            return;
        }

        console.log('This is a Reddit post page!');

        // Wait for page to load
        if (document.readyState !== 'complete') {
            console.log('Page not fully loaded, waiting...');
            window.addEventListener('load', () => {
                console.log('Page loaded, checking again...');
                this.initPostDetection();
            });
            return;
        }

        console.log('Page is fully loaded, checking extension status...');

        // Check if extension is configured
        const isConfigured = await this.checkExtensionStatus();
        console.log('Extension configured:', isConfigured);
        
        // Show popup if extension is configured and not shown before
        if (isConfigured && !this.popupShown) {
            console.log('Extension is configured, showing popup in 2 seconds...');
            // Small delay to let page settle
            setTimeout(() => {
                this.showExtensionPopup();
            }, 2000);
        } else {
            console.log('Extension not configured or popup already shown');
        }
    }

    // Get Reddit access token
    async getRedditToken() {
        try {
            const response = await fetch('https://www.reddit.com/api/v1/access_token', {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(this.redditClientId + ':' + this.redditClientSecret),
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': this.redditUserAgent
                },
                body: 'grant_type=client_credentials'
            });

            if (!response.ok) {
                throw new Error(`Reddit API error: ${response.status}`);
            }

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Error getting Reddit token:', error);
            throw error;
        }
    }

    // Convert Reddit URL to API format
    convertUrlToApiFormat(url) {
        // Remove trailing slash and .json if present
        url = url.replace(/\/$/, '').replace(/\.json$/, '');
        
        // Extract post ID from URL
        const match = url.match(/\/comments\/([a-zA-Z0-9]+)/);
        if (match) {
            const postId = match[1];
            return `https://oauth.reddit.com/comments/${postId}.json?limit=1000&depth=10`;
        }
        
        throw new Error('Invalid Reddit URL format');
    }

    // Fetch Reddit post data using Reddit API
    async fetchRedditData(url) {
        try {
            console.log('Getting Reddit access token...');
            const token = await this.getRedditToken();
            
            console.log('Converting URL to API format...');
            const apiUrl = this.convertUrlToApiFormat(url);
            
            console.log('Fetching Reddit data...');
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': this.redditUserAgent
                }
            });

            if (!response.ok) {
                throw new Error(`Reddit API error: ${response.status}`);
            }

            const data = await response.json();
            return this.parseRedditData(data);
        } catch (error) {
            console.error('Error fetching Reddit data:', error);
            throw error;
        }
    }

    // Parse Reddit API response
    parseRedditData(data) {
        if (!data || !data[0] || !data[0].data || !data[0].data.children || !data[0].data.children[0]) {
            throw new Error('Invalid Reddit API response');
        }

        const post = data[0].data.children[0].data;
        const comments = data[1] ? data[1].data.children : [];

        // Extract post information
        const postData = {
            title: post.title,
            content: post.selftext || '',
            subreddit: post.subreddit,
            author: post.author,
            score: post.score,
            upvote_ratio: post.upvote_ratio,
            num_comments: post.num_comments,
            created_utc: post.created_utc,
            url: post.url,
            permalink: post.permalink
        };

        // Extract all comments recursively
        const allComments = this.extractAllComments(comments);

        return {
            post: postData,
            comments: allComments,
            total_comments: allComments.length
        };
    }

    // Extract all comments recursively
    extractAllComments(comments, level = 0) {
        const extractedComments = [];

        comments.forEach(comment => {
            if (comment.kind === 't1') { // Comment type
                const commentData = comment.data;
                
                const extractedComment = {
                    author: commentData.author,
                    body: commentData.body,
                    score: commentData.score,
                    created_utc: commentData.created_utc,
                    level: level,
                    replies: []
                };

                // Extract replies if they exist
                if (commentData.replies && commentData.replies.data && commentData.replies.data.children) {
                    extractedComment.replies = this.extractAllComments(commentData.replies.data.children, level + 1);
                }

                extractedComments.push(extractedComment);
            }
        });

        return extractedComments;
    }

    // Format comments for OpenAI
    formatCommentsForOpenAI(comments) {
        let formatted = '';
        
        comments.forEach((comment, index) => {
            const indent = '  '.repeat(comment.level);
            formatted += `${indent}[${comment.author}] ${comment.body}\n`;
            
            if (comment.replies && comment.replies.length > 0) {
                formatted += this.formatCommentsForOpenAI(comment.replies);
            }
        });

        return formatted;
    }

    // Generate summary using OpenAI API
    async generateSummaryWithOpenAI(redditData) {
        try {
            console.log('Generating summary with OpenAI...');
            
            const { post, comments } = redditData;
            
            // Format the data for OpenAI
            const formattedData = `
Reddit Post Information:
Title: ${post.title}
Subreddit: r/${post.subreddit}
Author: ${post.author}
Score: ${post.score}
Upvote Ratio: ${post.upvote_ratio}
Number of Comments: ${post.num_comments}

Post Content:
${post.content}

Comments (${comments.length} total):
${this.formatCommentsForOpenAI(comments)}
`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful assistant that analyzes Reddit posts and provides comprehensive summaries. Focus on the main topic, key points, community reactions, and overall sentiment.'
                        },
                        {
                            role: 'user',
                            content: `Please provide a comprehensive analysis of this Reddit post and its comments:\n\n${formattedData}`
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API error: ${errorData.error?.message || response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error generating summary:', error);
            throw error;
        }
    }

    // Main function to analyze Reddit post
    async analyzeRedditPost(url) {
        try {
            console.log('Starting Reddit analysis...');
            
            // Fetch data from Reddit API
            const redditData = await this.fetchRedditData(url);
            console.log(`Fetched ${redditData.total_comments} comments`);
            
            // Generate summary with OpenAI
            const summary = await this.generateSummaryWithOpenAI(redditData);
            
            return {
                success: true,
                summary: summary,
                data: redditData
            };
        } catch (error) {
            console.error('Analysis error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Initialize analyzer
const analyzer = new RedditAnalyzer();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'setApiKeys') {
        analyzer.setApiKeys(request.openaiKey, request.redditClientId, request.redditClientSecret);
        sendResponse({ success: true });
        return true;
    }
    
    if (request.action === 'analyze') {
        analyzer.analyzeRedditPost(request.url)
            .then(result => {
                sendResponse(result);
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep message channel open for async response
    }

    if (request.action === 'checkStatus') {
        // Check if extension is configured
        chrome.storage.local.get(['setupComplete'], (result) => {
            sendResponse({ configured: result.setupComplete === true });
        });
        return true;
    }

    if (request.action === 'testPopup') {
        // Test function to manually show popup
        analyzer.testShowPopup();
        sendResponse({ success: true });
        return true;
    }
});

// Listen for messages from popup to open extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openPopup') {
        chrome.runtime.sendMessage({ action: 'openExtensionPopup' });
    }
});

// Initialize post detection when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - initializing post detection');
    analyzer.initPostDetection();
});

// Also check on navigation (for SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        console.log('URL changed, resetting detection');
        lastUrl = url;
        analyzer.extensionDetected = false; // Reset for new page
        analyzer.popupShown = false; // Reset popup state
        setTimeout(() => analyzer.initPostDetection(), 1000);
    }
}).observe(document, { subtree: true, childList: true });

// Also check when window loads
window.addEventListener('load', () => {
    console.log('Window loaded - checking post detection');
    setTimeout(() => analyzer.initPostDetection(), 1000);
});

// Add test function to window for debugging
window.testRedditExtension = () => {
    console.log('Manual test triggered');
    analyzer.testShowPopup();
};

// Check if extension is loaded
console.log('Chrome extension available:', typeof chrome !== 'undefined');

// Check if our test function exists
console.log('Test function available:', typeof window.testRedditExtension === 'function');

// Try to show popup manually
if (typeof window.testRedditExtension === 'function') {
    window.testRedditExtension();
} else {
    console.log('Extension not loaded properly');
}

console.log('Reddit GPT Summarizer content script loaded (API mode with post detection)');
console.log('To test popup manually, run: window.testRedditExtension() in console'); 