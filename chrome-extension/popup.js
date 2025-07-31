// Popup script for Reddit GPT Summarizer
// Handles user interface and API key management

class PopupController {
    constructor() {
        console.log('=== PopupController Initializing ===');
        this.apiKeys = {
            openaiKey: '',
            redditClientId: '',
            redditClientSecret: ''
        };
        this.isFirstTime = true;
        
        this.initializeElements();
        this.setupEventListeners();
        
        // Initialize with a slight delay to ensure DOM is ready
        setTimeout(() => {
            this.initialize();
        }, 100);
    }

    initialize() {
        console.log('=== Starting Initialization ===');
        this.loadSavedKeys();
        this.checkFirstTime();
    }

    initializeElements() {
        console.log('Initializing elements...');
        
        // Setup wizard elements
        this.setupWizard = document.getElementById('setupWizard');
        this.mainInterface = document.getElementById('mainInterface');
        this.configureKeysBtn = document.getElementById('configureKeysBtn');
        
        // API key input elements
        this.openaiKeyInput = document.getElementById('openaiKey');
        this.redditClientIdInput = document.getElementById('redditClientId');
        this.redditClientSecretInput = document.getElementById('redditClientSecret');
        
        // Button elements
        this.saveKeysBtn = document.getElementById('saveKeysBtn');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        
        // Status and display elements
        this.statusElement = document.getElementById('status');
        this.summaryElement = document.getElementById('summary');
        this.statsElement = document.getElementById('stats');
        
        console.log('Elements initialized:', {
            setupWizard: !!this.setupWizard,
            mainInterface: !!this.mainInterface,
            openaiKeyInput: !!this.openaiKeyInput,
            redditClientIdInput: !!this.redditClientIdInput,
            redditClientSecretInput: !!this.redditClientSecretInput,
            saveKeysBtn: !!this.saveKeysBtn,
            analyzeBtn: !!this.analyzeBtn
        });
    }

    loadSavedKeys() {
        console.log('Loading saved keys...');
        chrome.storage.local.get(['openaiApiKey', 'redditClientId', 'redditClientSecret'], (result) => {
            console.log('Storage result:', result);
            
            this.apiKeys.openaiKey = result.openaiApiKey || '';
            this.apiKeys.redditClientId = result.redditClientId || '';
            this.apiKeys.redditClientSecret = result.redditClientSecret || '';
            
            console.log('Loaded API keys:', {
                openai: this.apiKeys.openaiKey ? '***' : 'empty',
                redditId: this.apiKeys.redditClientId ? '***' : 'empty',
                redditSecret: this.apiKeys.redditClientSecret ? '***' : 'empty'
            });
            
            // Update input fields
            if (this.openaiKeyInput) this.openaiKeyInput.value = this.apiKeys.openaiKey;
            if (this.redditClientIdInput) this.redditClientIdInput.value = this.apiKeys.redditClientId;
            if (this.redditClientSecretInput) this.redditClientSecretInput.value = this.apiKeys.redditClientSecret;
            
            this.updateStatus();
        });
    }

    checkFirstTime() {
        console.log('Checking if first time...');
        chrome.storage.local.get(['setupComplete', 'openaiApiKey', 'redditClientId', 'redditClientSecret'], (result) => {
            console.log('Setup check result:', result);
            
            // Check if we have all required keys and setup is complete
            const hasAllKeys = result.openaiApiKey && result.redditClientId && result.redditClientSecret;
            const setupComplete = result.setupComplete === true;
            
            console.log('Setup analysis:', {
                hasAllKeys,
                setupComplete,
                openaiKey: !!result.openaiApiKey,
                redditId: !!result.redditClientId,
                redditSecret: !!result.redditClientSecret
            });
            
            // Only show setup wizard if we don't have all keys OR setup is not complete
            this.isFirstTime = !hasAllKeys || !setupComplete;
            
            console.log('Is first time:', this.isFirstTime);
            
            if (this.isFirstTime) {
                console.log('Showing setup wizard');
                this.showSetupWizard();
            } else {
                console.log('Showing main interface');
                this.showMainInterface();
            }
        });
    }

    showSetupWizard() {
        console.log('Showing setup wizard');
        if (this.setupWizard) {
            this.setupWizard.classList.remove('hidden');
            console.log('Setup wizard shown');
        } else {
            console.error('Setup wizard element not found!');
        }
        if (this.mainInterface) {
            this.mainInterface.classList.add('hidden');
            console.log('Main interface hidden');
        } else {
            console.error('Main interface element not found!');
        }
    }

    showMainInterface() {
        console.log('Showing main interface');
        if (this.setupWizard) {
            this.setupWizard.classList.add('hidden');
            console.log('Setup wizard hidden');
        } else {
            console.error('Setup wizard element not found!');
        }
        if (this.mainInterface) {
            this.mainInterface.classList.remove('hidden');
            console.log('Main interface shown');
        } else {
            console.error('Main interface element not found!');
        }
    }

    // Force refresh the interface
    refreshInterface() {
        console.log('Refreshing interface...');
        this.loadSavedKeys();
        this.checkFirstTime();
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Save API keys button
        if (this.saveKeysBtn) {
            this.saveKeysBtn.addEventListener('click', () => {
                console.log('Save keys button clicked');
                this.saveApiKeys();
            });
        } else {
            console.error('Save keys button not found!');
        }

        // Configure API keys button
        if (this.configureKeysBtn) {
            this.configureKeysBtn.addEventListener('click', () => {
                console.log('Configure keys button clicked');
                this.showSetupWizard();
            });
        } else {
            console.error('Configure keys button not found!');
        }

        // Analyze Reddit post button
        if (this.analyzeBtn) {
            this.analyzeBtn.addEventListener('click', () => {
                console.log('Analyze button clicked');
                this.analyzeRedditPost();
            });
        } else {
            console.error('Analyze button not found!');
        }

        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'openExtensionPopup') {
                console.log('Popup opened from background script');
                // Focus the popup if it's already open
                if (this.mainInterface && !this.mainInterface.classList.contains('hidden')) {
                    this.analyzeBtn.focus();
                }
            }
        });

        // Add debug functions to window for testing
        window.debugExtension = () => {
            console.log('=== Extension Debug Info ===');
            console.log('API Keys:', this.apiKeys);
            console.log('Is First Time:', this.isFirstTime);
            chrome.storage.local.get(null, (result) => {
                console.log('All Storage:', result);
            });
        };

        // Add function to force show main interface
        window.forceMainInterface = () => {
            console.log('Forcing main interface...');
            chrome.storage.local.set({
                setupComplete: true,
                openaiApiKey: 'test-key',
                redditClientId: 'test-id',
                redditClientSecret: 'test-secret'
            }, () => {
                this.refreshInterface();
            });
        };

        // Add function to clear storage
        window.clearStorage = () => {
            console.log('Clearing storage...');
            chrome.storage.local.clear(() => {
                this.refreshInterface();
            });
        };

        // Add function to manually save keys
        window.manualSaveKeys = () => {
            console.log('Manually saving keys...');
            const openaiKey = this.openaiKeyInput ? this.openaiKeyInput.value : '';
            const redditId = this.redditClientIdInput ? this.redditClientIdInput.value : '';
            const redditSecret = this.redditClientSecretInput ? this.redditClientSecretInput.value : '';
            
            chrome.storage.local.set({
                openaiApiKey: openaiKey,
                redditClientId: redditId,
                redditClientSecret: redditSecret,
                setupComplete: true
            }, () => {
                console.log('Keys saved manually');
                this.refreshInterface();
            });
        };
    }

    saveApiKeys() {
        const openaiKey = this.openaiKeyInput ? this.openaiKeyInput.value.trim() : '';
        const redditClientId = this.redditClientIdInput ? this.redditClientIdInput.value.trim() : '';
        const redditClientSecret = this.redditClientSecretInput ? this.redditClientSecretInput.value.trim() : '';

        console.log('Saving API keys:', { 
            openaiKey: openaiKey ? '***' : 'empty', 
            redditClientId: redditClientId ? '***' : 'empty', 
            redditClientSecret: redditClientSecret ? '***' : 'empty' 
        });

        // Validate OpenAI key format
        if (openaiKey && !openaiKey.startsWith('sk-')) {
            this.updateStatus('❌ OpenAI API key should start with "sk-"', 'error');
            return;
        }

        // Check if all keys are provided
        if (!openaiKey || !redditClientId || !redditClientSecret) {
            this.updateStatus('❌ Please fill in all API keys', 'error');
            return;
        }

        // Save to storage
        chrome.storage.local.set({
            openaiApiKey: openaiKey,
            redditClientId: redditClientId,
            redditClientSecret: redditClientSecret,
            setupComplete: true
        }, () => {
            console.log('API keys saved successfully');
            this.apiKeys = { openaiKey, redditClientId, redditClientSecret };
            this.updateStatus('✅ API keys saved successfully!', 'success');
            
            // Show main interface after a short delay
            setTimeout(() => {
                this.showMainInterface();
            }, 1000);
        });
    }

    updateStatus(message, type = 'info') {
        console.log('Updating status:', message, type);
        
        if (this.statusElement) {
            this.statusElement.textContent = message;
            this.statusElement.className = `status ${type}`;
        }
        
        // Enable/disable analyze button based on key presence
        if (this.analyzeBtn) {
            const hasKeys = this.apiKeys.openaiKey && this.apiKeys.redditClientId && this.apiKeys.redditClientSecret;
            console.log('Has keys:', hasKeys, 'Keys:', { 
                openai: !!this.apiKeys.openaiKey, 
                redditId: !!this.apiKeys.redditClientId, 
                redditSecret: !!this.apiKeys.redditClientSecret 
            });
            
            this.analyzeBtn.disabled = !hasKeys;
            this.analyzeBtn.textContent = hasKeys ? '🔍 Analyze Reddit Post' : '🔑 Configure API Keys First';
        }
    }

    async analyzeRedditPost() {
        this.updateStatus('🔍 Analyzing Reddit post...', 'loading');
        
        try {
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab.url || !tab.url.includes('reddit.com')) {
                this.updateStatus('❌ Please navigate to a Reddit post page', 'error');
                return;
            }

            // Send API keys to content script
            await chrome.tabs.sendMessage(tab.id, {
                action: 'setApiKeys',
                openaiKey: this.apiKeys.openaiKey,
                redditClientId: this.apiKeys.redditClientId,
                redditClientSecret: this.apiKeys.redditClientSecret
            });

            // Send analyze request
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'analyze',
                url: tab.url
            });

            if (response.success) {
                this.displaySummary(response.summary, response.data);
                this.updateStatus('✅ Analysis complete!', 'success');
            } else {
                this.updateStatus(`❌ Error: ${response.error}`, 'error');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            this.updateStatus(`❌ Error: ${error.message}`, 'error');
        }
    }

    displaySummary(summary, data) {
        console.log('Displaying summary:', summary);
        console.log('Displaying data:', data);
        
        if (this.summaryElement) {
            // Make the summary element visible
            this.summaryElement.style.display = 'block';
            
            // Format the summary with proper HTML
            const formattedSummary = summary
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            this.summaryElement.innerHTML = `<strong>📊 AI Analysis Summary:</strong><br><br>${formattedSummary}`;
            console.log('Summary element updated');
        } else {
            console.error('Summary element not found!');
        }
        
        if (this.statsElement && data) {
            // Make the stats element visible
            this.statsElement.style.display = 'block';
            
            const stats = `
                <strong>📈 Post Statistics:</strong><br>
                • <strong>Title:</strong> ${data.post.title}<br>
                • <strong>Subreddit:</strong> r/${data.post.subreddit}<br>
                • <strong>Comments:</strong> ${data.total_comments}<br>
                • <strong>Score:</strong> ${data.post.score}<br>
                • <strong>Author:</strong> ${data.post.author}
            `;
            this.statsElement.innerHTML = stats;
            console.log('Stats element updated');
        } else {
            console.error('Stats element not found or no data!');
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - creating PopupController');
    new PopupController();
}); 