// Background script for Reddit GPT Summarizer
// Service worker for handling extension events

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request);
    
    if (request.action === 'checkStatus') {
        // Check if extension is configured
        chrome.storage.local.get(['setupComplete', 'openaiApiKey', 'redditClientId', 'redditClientSecret'], (result) => {
            console.log('Extension status check:', result);
            const configured = result.setupComplete === true && result.openaiApiKey && result.redditClientId && result.redditClientSecret;
            console.log('Extension configured:', configured);
            sendResponse({ configured: configured });
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'openExtensionPopup') {
        console.log('Opening extension popup...');
        // Open the extension popup
        chrome.action.openPopup();
        sendResponse({ success: true });
        return true;
    }
});

// Monitor tab updates to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('Tab updated:', tab.url, changeInfo.status);
    
    // Check if this is a Reddit post page
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('reddit.com') && tab.url.includes('/comments/')) {
        console.log('Reddit post page detected, injecting content script');
        
        // Inject content script
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).then(() => {
            console.log('Content script injected successfully');
        }).catch((error) => {
            console.error('Error injecting content script:', error);
        });
    }
});

// Extension installation event
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details);
    
    if (details.reason === 'install') {
        console.log('First time installation');
        // Set default storage values
        chrome.storage.local.set({
            setupComplete: false,
            openaiApiKey: '',
            redditClientId: '',
            redditClientSecret: ''
        }, () => {
            console.log('Default storage values set');
        });
    }
});

console.log('Reddit GPT Summarizer background script loaded'); 