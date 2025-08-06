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
        this.isAnalyzing = false; // Add flag to prevent duplicate analysis
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

    // Convert Reddit URL to API format with different sorting options
    convertUrlToApiFormat(url, sort = 'top') {
        // Remove trailing slash and .json if present
        url = url.replace(/\/$/, '').replace(/\.json$/, '');
        
        // Extract post ID from URL
        const match = url.match(/\/comments\/([a-zA-Z0-9]+)/);
        if (match) {
            const postId = match[1];
            console.log(`Extracted post ID from URL: ${postId}`);
            // Try different sorting options to get more comments
            // Add showmore=true to explicitly request more comments
            return `https://oauth.reddit.com/comments/${postId}.json?limit=1000&depth=25&sort=${sort}&showmore=true&raw_json=1`;
        }
        
        throw new Error('Invalid Reddit URL format');
    }

    // Fetch Reddit post data using Reddit API with multiple sorting attempts
    async fetchRedditData(url) {
        try {
            console.log('Getting Reddit access token...');
            const token = await this.getRedditToken();
            
            // Extract post ID from URL for additional calls
            const urlMatch = url.match(/\/comments\/[a-zA-Z0-9]+/);
            const postId = urlMatch ? urlMatch[1] : null;
            
            // Try different sorting options to get more comments
            const sortOptions = ['top', 'best', 'new', 'controversial'];
            let bestData = null;
            let bestCommentCount = 0;
            
            for (const sort of sortOptions) {
                try {
                    console.log(`Trying sort: ${sort}`);
                    const apiUrl = this.convertUrlToApiFormat(url, sort);
            
                    console.log('Fetching Reddit data...');
                    const response = await fetch(apiUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'User-Agent': this.redditUserAgent
                        }
                    });

                    if (!response.ok) {
                        console.log(`Sort ${sort} failed with status: ${response.status}`);
                        continue;
                    }

                    const data = await response.json();
                    const parsedData = await this.parseRedditData(data, token);
                    
                    console.log(`Sort ${sort} returned ${parsedData.total_comments} comments`);
                    
                    if (parsedData.total_comments > bestCommentCount) {
                        bestCommentCount = parsedData.total_comments;
                        bestData = parsedData;
                        console.log(`New best: ${bestCommentCount} comments with sort ${sort}`);
                    }
                    
                    // If we got a good number of comments, we can stop
                    if (parsedData.total_comments >= parsedData.post.num_comments * 0.8) {
                        console.log(`Got ${parsedData.total_comments} comments (${((parsedData.total_comments / parsedData.post.num_comments) * 100).toFixed(1)}% of total), stopping search`);
                        break;
                    }
                    
                    // Small delay between attempts
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                } catch (error) {
                    console.error(`Error with sort ${sort}:`, error);
                    continue;
                }
            }
            
            // If we didn't get enough comments, try additional API calls
            if (bestData && bestData.total_comments < bestData.post.num_comments * 0.7 && postId) {
                console.log('Not enough comments found, trying additional API calls...');
                const additionalData = await this.fetchAdditionalComments(postId, token, 'top');
                
                if (additionalData && additionalData.total_comments > bestData.total_comments) {
                    console.log(`Additional API calls improved comment count from ${bestData.total_comments} to ${additionalData.total_comments}`);
                    bestData = additionalData;
                }
            }
            
            if (bestData) {
                console.log(`Using best result: ${bestData.total_comments} comments`);
                return bestData;
            } else {
                throw new Error('Failed to fetch Reddit data with any sorting option');
            }
        } catch (error) {
            console.error('Error fetching Reddit data:', error);
            throw error;
        }
    }

    // Parse Reddit API response with PRAW-style comment extraction
    async parseRedditData(data, token = null) {
        if (!data || !data[0] || !data[0].data || !data[0].data.children || !data[0].data.children[0]) {
            throw new Error('Invalid Reddit API response');
        }

        const post = data[0].data.children[0].data;
        const comments = data[1] ? data[1].data.children : [];

        console.log(`Post reports ${post.num_comments} total comments`);
        console.log(`Initial API response contains ${comments.length} top-level comments`);
        console.log(`Post ID: ${post.id}`);
        console.log(`Token available: ${!!token}`);

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

        // Use PRAW's exact approach: replace_more() + breadth-first traversal
        const allComments = await this.replaceMoreCommentsPRAWStyle(comments, post.id, token, null, 0);

        console.log(`Final comment count: ${allComments.length} out of ${post.num_comments} reported`);
        console.log(`Comment fetch rate: ${((allComments.length / post.num_comments) * 100).toFixed(1)}%`);

        return {
            post: postData,
            comments: allComments,
            total_comments: allComments.length
        };
    }

    // Implement PRAW's replace_more() logic in JavaScript
    async replaceMoreComments(comments, postId, token, limit = null, threshold = 0) {
        console.log('=== Implementing PRAW replace_more() logic ===');
        
        let moreCommentsFound = 0;
        let totalReplaced = 0;
        
        // Recursively process comments and replace MoreComments
        const processCommentLevel = async (commentList, level = 0) => {
            const processedComments = [];
            
            for (const comment of commentList) {
                if (comment.kind === 't1') {
                    // Regular comment - keep it and process its replies
                    const processedComment = { ...comment };
                    
                    if (comment.data.replies && comment.data.replies.data && comment.data.replies.data.children) {
                        processedComment.data.replies.data.children = await processCommentLevel(
                            comment.data.replies.data.children, 
                            level + 1
                        );
                    }
                    
                    processedComments.push(processedComment);
                } else if (comment.kind === 'more') {
                    // MoreComments object - replace it with actual comments
                    moreCommentsFound++;
                    const moreCount = comment.data.count || 0;
                    
                    console.log(`Level ${level}: Found MoreComments with ${moreCount} comments`);
                    
                    // Check threshold
                    if (moreCount < threshold) {
                        console.log(`Level ${level}: Skipping MoreComments (${moreCount} < ${threshold})`);
                        continue;
                    }
                    
                    // Check limit
                    if (limit !== null && totalReplaced >= limit) {
                        console.log(`Level ${level}: Reached limit (${totalReplaced}/${limit})`);
                        continue;
                    }
                    
                    // Fetch the additional comments
                    if (postId && token && comment.data.children && comment.data.children.length > 0) {
                        try {
                            console.log(`Level ${level}: Replacing MoreComments with ${comment.data.children.length} comment IDs`);
                            
                            // Format comment IDs like PRAW does
                            const commentIds = comment.data.children.map(id => {
                                if (id.startsWith('t1_')) {
                                    return id;
                                } else {
                                    return `t1_${id}`;
                                }
                            });
                            
                            const moreComments = await this.fetchMoreCommentsPRAWStyle(postId, commentIds, token);
                                           
                            // Recursively process the fetched comments
                            const processedMoreComments = await processCommentLevel(moreComments, level);
                            processedComments.push(...processedMoreComments);
                            
                            totalReplaced++;
                            console.log(`Level ${level}: Successfully replaced MoreComments with ${processedMoreComments.length} comments`);
                            
                        } catch (error) {
                            console.error(`Level ${level}: Failed to replace MoreComments:`, error);
                        }
                    }
                } else {
                    console.log(`Level ${level}: Unknown comment kind: ${comment.kind}`);
                }
            }
            
            return processedComments;
        };
        
        const result = await processCommentLevel(comments);
        
        console.log(`=== PRAW-style replace_more() completed ===`);
        console.log(`Found ${moreCommentsFound} MoreComments objects`);
        console.log(`Replaced ${totalReplaced} MoreComments objects`);
        console.log(`Final comment count: ${result.length}`);
        
        return result;
    }

    // PRAW-style MoreComments fetching
    async fetchMoreCommentsPRAWStyle(postId, commentIds, token) {
        try {
            console.log(`PRAW-style fetchMoreComments: ${commentIds.length} comment IDs`);
            
            // Use PRAW's approach: single API call with all comment IDs
            const childrenParam = commentIds.join(',');
            const moreChildrenUrl = `https://oauth.reddit.com/api/morechildren.json?link_id=t3_${postId}&children=${childrenParam}&limit_children=false&api_type=json`;
            
            console.log(`PRAW-style API call: ${moreChildrenUrl}`);
            
            const response = await fetch(moreChildrenUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': this.redditUserAgent
                }
            });

            if (!response.ok) {
                throw new Error(`MoreComments API error: ${response.status}`);
            }

            const data = await response.json();
            console.log(`PRAW-style response:`, data);
            
            if (data.json && data.json.data && data.json.data.things) {
                const comments = data.json.data.things.filter(item => item.kind === 't1');
                console.log(`PRAW-style returned ${comments.length} valid comments`);
                return comments;
            } else {
                console.log(`PRAW-style response structure unexpected:`, data);
                return [];
            }
        } catch (error) {
            console.error('PRAW-style fetchMoreComments error:', error);
            return [];
        }
    }

    // Improved comment extraction that handles MoreComments
    async extractAllCommentsImproved(comments, level = 0, postId = null, token = null) {
        const extractedComments = [];
        let moreCommentsFound = 0;
        let totalMoreComments = 0;
        
        console.log(`Level ${level}: Processing ${comments.length} items`);
        
        for (const comment of comments) {
            console.log(`Level ${level}: Processing item kind: ${comment.kind}`);
            
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
                    console.log(`Level ${level}: Processing replies for comment by ${commentData.author}`);
                    extractedComment.replies = await this.extractAllCommentsImproved(commentData.replies.data.children, level + 1, postId, token);
                }

                extractedComments.push(extractedComment);
            } else if (comment.kind === 'more') {
                // Handle MoreComments objects - these represent "load more comments" links
                moreCommentsFound++;
                totalMoreComments += comment.data.count || 0;
                console.log(`Found MoreComments object at level ${level} with ${comment.data.count} more comments`);
                console.log(`MoreComments data:`, comment.data);
                
                if (postId && token && comment.data.children && comment.data.children.length > 0) {
                    console.log(`Attempting to fetch ${comment.data.children.length} comment IDs:`, comment.data.children);
                    
                    // Check if comment IDs need t1_ prefix
                    const commentIds = comment.data.children.map(id => {
                        if (id.startsWith('t1_')) {
                            return id;
                        } else {
                            return `t1_${id}`;
                        }
                    });
                    console.log(`Processed comment IDs:`, commentIds);
                    
                    try {
                        // Fetch the additional comments
                        const moreComments = await this.fetchMoreComments(postId, commentIds, token);
                        
                        // Recursively extract these additional comments
                        const additionalComments = await this.extractAllCommentsImproved(moreComments, level, postId, token);
                        extractedComments.push(...additionalComments);
                        
                        console.log(`Successfully fetched ${additionalComments.length} additional comments at level ${level}`);
                    } catch (error) {
                        console.error('Failed to fetch more comments:', error);
                    }
                } else {
                    console.log('Cannot fetch more comments - missing postId, token, or comment IDs');
                    console.log('postId:', postId);
                    console.log('token:', !!token);
                    console.log('comment.data.children:', comment.data.children);
                }
            } else {
                console.log(`Level ${level}: Unknown comment kind: ${comment.kind}`);
            }
        }

        if (moreCommentsFound > 0) {
            console.log(`Level ${level}: Found ${moreCommentsFound} MoreComments objects with ${totalMoreComments} total additional comments`);
        }

        return extractedComments;
    }

    // Extract all comments recursively (keeping old method for compatibility)
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

    // Generate summary using OpenAI API - single call with all data
    async generateSummaryWithOpenAI(redditData) {
        try {
            console.log('=== Starting generateSummaryWithOpenAI ===');
            
            const { post, comments } = redditData;
            console.log(`Processing ${comments.length} comments in single API call...`);
            
            // Always use single API call with all data
            const result = await this.generateSingleSummary(redditData);
            console.log('=== Single API call completed ===');
            return result;
        } catch (error) {
            console.error('Error generating summary:', error);
            throw error;
        }
    }

    // Single API call method with all comments
    async generateSingleSummary(redditData) {
        console.log('=== Making single API call with all data ===');
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
                max_tokens: 1500,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`OpenAI API error: ${errorData.error?.message || response.status}`);
            }

            const data = await response.json();
        console.log('=== Single API call completed ===');
            return data.choices[0].message.content;
    }

    // Main function to analyze Reddit post
    async analyzeRedditPost(url) {
        // Prevent duplicate analysis calls
        if (this.isAnalyzing) {
            console.log('Analysis already in progress, ignoring duplicate request');
            return {
                success: false,
                error: 'Analysis already in progress'
            };
        }

        this.isAnalyzing = true;
        console.log('Starting Reddit analysis...');
        
        try {
            // Fetch data from Reddit API
            const redditData = await this.fetchRedditData(url);
            console.log(`Fetched ${redditData.total_comments} comments`);
            
            // Generate summary with OpenAI
            const summary = await this.generateSummaryWithOpenAI(redditData);
            
            // Store results for later retrieval
            this.storeResults(summary, redditData);
            
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
        } finally {
            this.isAnalyzing = false; // Reset flag when done
        }
    }

    // Continue analysis in background when popup is closed
    continueAnalysisInBackground() {
        console.log('Analysis will continue in background...');
        
        // Store analysis state in localStorage so it can be retrieved later
        const analysisState = {
            timestamp: Date.now(),
            url: window.location.href,
            status: 'running'
        };
        
        localStorage.setItem('redditAnalysisState', JSON.stringify(analysisState));
        
        // Show a notification to the user
        this.showBackgroundAnalysisNotification();
    }

    // Show notification that analysis is continuing in background
    showBackgroundAnalysisNotification() {
        // Create a notification element
        const notification = document.createElement('div');
        notification.id = 'reddit-analysis-notification';
        notification.innerHTML = `
            <div class="reddit-analysis-notification-content">
                <span class="reddit-analysis-notification-icon">🤖</span>
                <span class="reddit-analysis-notification-text">
                    Analysis continuing in background... 
                    <a href="#" id="reddit-analysis-check-results">Check Results</a>
                </span>
                <button class="reddit-analysis-notification-close" id="reddit-analysis-notification-close">×</button>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #reddit-analysis-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10001;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 300px;
                animation: slideInNotification 0.3s ease-out;
            }

            @keyframes slideInNotification {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .reddit-analysis-notification-content {
                padding: 12px 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .reddit-analysis-notification-icon {
                font-size: 16px;
            }

            .reddit-analysis-notification-text {
                font-size: 12px;
                line-height: 1.3;
                flex-grow: 1;
            }

            .reddit-analysis-notification-text a {
                color: white;
                text-decoration: underline;
                font-weight: 500;
            }

            .reddit-analysis-notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }

            .reddit-analysis-notification-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;

        // Add to page
        document.head.appendChild(style);
        document.body.appendChild(notification);

        // Add event listeners
        const closeBtn = document.getElementById('reddit-analysis-notification-close');
        const checkResultsBtn = document.getElementById('reddit-analysis-check-results');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }

        if (checkResultsBtn) {
            checkResultsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                notification.remove();
                // Open the extension popup to check results
                chrome.runtime.sendMessage({ action: 'openExtensionPopup' });
            });
        }

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    // Get stored analysis results
    getStoredResults() {
        try {
            const storedResults = localStorage.getItem('redditAnalysisResults');
            if (storedResults) {
                const results = JSON.parse(storedResults);
                // Check if results are for the current page
                if (results.url === window.location.href) {
                    return results;
                }
            }
        } catch (error) {
            console.error('Error getting stored results:', error);
        }
        return null;
    }

    // Store analysis results
    storeResults(summary, data) {
        try {
            const results = {
                url: window.location.href,
                timestamp: Date.now(),
                summary: summary,
                data: data
            };
            localStorage.setItem('redditAnalysisResults', JSON.stringify(results));
            console.log('Analysis results stored');
        } catch (error) {
            console.error('Error storing results:', error);
        }
    }

    // Fetch additional comments using different API parameters
    async fetchAdditionalComments(postId, token, sort = 'top') {
        try {
            console.log(`Fetching additional comments with sort: ${sort}`);
            
            // Try different API endpoints to get more comments
            const apiUrls = [
                `https://oauth.reddit.com/comments/${postId}.json?limit=1000&depth=25&sort=${sort}&showmore=true&raw_json=1`,
                `https://oauth.reddit.com/comments/${postId}.json?limit=1000&depth=50&sort=${sort}&raw_json=1`,
                `https://oauth.reddit.com/comments/${postId}.json?limit=2000&depth=25&sort=${sort}&raw_json=1`
            ];
            
            let bestData = null;
            let bestCommentCount = 0;
            
            for (let i = 0; i < apiUrls.length; i++) {
                try {
                    console.log(`Trying additional API call ${i + 1}: ${apiUrls[i]}`);
                    
                    const response = await fetch(apiUrls[i], {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'User-Agent': this.redditUserAgent
                        }
                    });

                    if (!response.ok) {
                        console.log(`Additional API call ${i + 1} failed with status: ${response.status}`);
                        continue;
                    }

                    const data = await response.json();
                    const parsedData = await this.parseRedditData(data, token);
                    
                    console.log(`Additional API call ${i + 1} returned ${parsedData.total_comments} comments`);
                    
                    if (parsedData.total_comments > bestCommentCount) {
                        bestCommentCount = parsedData.total_comments;
                        bestData = parsedData;
                        console.log(`New best from additional call: ${bestCommentCount} comments`);
                    }
                    
                    // Small delay between attempts
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                } catch (error) {
                    console.error(`Error with additional API call ${i + 1}:`, error);
                    continue;
                }
            }
            
            return bestData;
        } catch (error) {
            console.error('Error fetching additional comments:', error);
            return null;
        }
    }

    // Implement PRAW's exact approach: replace_more() + breadth-first traversal
    async replaceMoreCommentsPRAWStyle(comments, postId, token, limit = null, threshold = 0) {
        console.log('=== Implementing PRAW replace_more() + breadth-first traversal ===');
        
        // Step 1: Replace all MoreComments objects (like PRAW's replace_more())
        const processedComments = await this.replaceMoreComments(comments, postId, token, limit, threshold);
        
        // Step 2: Use PRAW's breadth-first traversal approach
        console.log('=== Starting PRAW-style breadth-first traversal ===');
        
        const allComments = [];
        const commentQueue = [...processedComments]; // Seed with top-level comments
        
        while (commentQueue.length > 0) {
            const comment = commentQueue.shift(); // pop(0) equivalent
            
            if (comment.kind === 't1') {
                // Extract comment data like PRAW does
                const commentData = {
                    author: comment.data.author,
                    body: comment.data.body,
                    score: comment.data.score,
                    created_utc: comment.data.created_utc,
                    level: 0, // Will be calculated during traversal
                    replies: []
                };
                
                allComments.push(commentData);
                // console.log(`PRAW traversal: Processing comment by ${commentData.author}`);
                
                // Add replies to queue (extend equivalent)
                if (comment.data.replies && comment.data.replies.data && comment.data.replies.data.children) {
                    // Add level information to replies
                    const repliesWithLevel = comment.data.replies.data.children.map(reply => ({
                        ...reply,
                        level: (comment.level || 0) + 1
                    }));
                    commentQueue.push(...repliesWithLevel);
                }
            }
        }
        
        console.log(`=== PRAW-style traversal completed ===`);
        console.log(`Total comments extracted: ${allComments.length}`);
        
        return allComments;
    }

    // Alternative: Direct PRAW-style list() method equivalent
    async getCommentsPRAWListStyle(comments, postId, token, limit = null, threshold = 0) {
        console.log('=== Implementing PRAW list() method equivalent ===');
        
        // Step 1: Replace MoreComments (like PRAW's replace_more())
        const processedComments = await this.replaceMoreComments(comments, postId, token, limit, threshold);
        
        // Step 2: Use PRAW's list() method approach (breadth-first)
        const allComments = [];
        const commentQueue = [...processedComments];
        
        while (commentQueue.length > 0) {
            const comment = commentQueue.shift();
            
            if (comment.kind === 't1') {
                const commentData = {
                    author: comment.data.author,
                    body: comment.data.body,
                    score: comment.data.score,
                    created_utc: comment.data.created_utc,
                    level: comment.level || 0,
                    replies: []
                };
                
                allComments.push(commentData);
                
                // Add replies to queue for breadth-first traversal
                if (comment.data.replies && comment.data.replies.data && comment.data.replies.data.children) {
                    const repliesWithLevel = comment.data.replies.data.children.map(reply => ({
                        ...reply,
                        level: commentData.level + 1
                    }));
                    commentQueue.push(...repliesWithLevel);
                }
            }
        }
        
        console.log(`PRAW list() equivalent: ${allComments.length} comments`);
        return allComments;
    }
}

// Initialize analyzer
const analyzer = new RedditAnalyzer();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    if (request.action === 'checkStatus') {
        console.log('Status check received - content script is loaded');
        sendResponse({ 
            success: true, 
            message: 'Content script is loaded and ready',
            timestamp: Date.now()
        });
        return true;
    }
    
    if (request.action === 'setApiKeys') {
        console.log('Setting API keys...');
        analyzer.setApiKeys(request.openaiKey, request.redditClientId, request.redditClientSecret);
        sendResponse({ success: true, message: 'API keys set successfully' });
        return true;
    }
    
    if (request.action === 'analyze') {
        console.log('Analyze request received:', request.url);
        console.log('Current analysis state:', analyzer.isAnalyzing);
        
        analyzer.analyzeRedditPost(request.url)
            .then(result => {
                console.log('Analysis completed with result:', result.success);
                sendResponse(result);
            })
            .catch(error => {
                console.error('Analysis failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep message channel open for async response
    }

    if (request.action === 'continueAnalysisInBackground') {
        console.log('Continuing analysis in background...');
        // Store the current analysis state so it can continue even if popup is closed
        analyzer.continueAnalysisInBackground();
        sendResponse({ success: true });
        return true;
    }

    if (request.action === 'checkForResults') {
        console.log('Checking for existing analysis results...');
        const results = analyzer.getStoredResults();
        if (results) {
            sendResponse({ 
                hasResults: true, 
                summary: results.summary, 
                data: results.data 
            });
        } else {
            sendResponse({ hasResults: false });
        }
        return true;
    }

    if (request.action === 'testPopup') {
        // Test function to manually show popup
        analyzer.testShowPopup();
        sendResponse({ success: true });
        return true;
    }

    if (request.action === 'openPopup') {
        chrome.runtime.sendMessage({ action: 'openExtensionPopup' });
        sendResponse({ success: true });
        return true;
    }
    
    // Default response for unknown actions
    console.log('Unknown action received:', request.action);
    sendResponse({ success: false, error: 'Unknown action' });
    return true;
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