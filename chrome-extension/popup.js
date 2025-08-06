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
        this.isAnalyzing = false; // Track analysis state
        
        this.initialize();
    }

    initialize() {
        this.initializeElements();
        this.setupEventListeners(); // Add this missing call
        this.loadSavedKeys();
        this.checkFirstTime();
        
        // Add test button for debugging
        this.addTestButton();
        
        // Check for existing analysis results
        setTimeout(() => {
            this.checkForExistingResults();
        }, 500); // Small delay to ensure everything is loaded
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
            analyzeBtn: !!this.analyzeBtn,
            statusElement: !!this.statusElement,
            summaryElement: !!this.summaryElement,
            statsElement: !!this.statsElement
        });

        // Debug: Check if save button exists in DOM
        const saveBtnInDOM = document.getElementById('saveKeysBtn');
        console.log('Save button in DOM:', !!saveBtnInDOM);
        if (saveBtnInDOM) {
            console.log('Save button text:', saveBtnInDOM.textContent);
            console.log('Save button disabled:', saveBtnInDOM.disabled);
        }
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
            console.log('Save button found, adding event listener');
            this.saveKeysBtn.addEventListener('click', () => {
                console.log('Save keys button clicked');
                this.saveApiKeys();
            });
        } else {
            console.error('Save keys button not found!');
            // Try to find it again
            const saveBtn = document.getElementById('saveKeysBtn');
            console.log('Trying to find save button again:', !!saveBtn);
            if (saveBtn) {
                console.log('Found save button on second try, adding event listener');
                this.saveKeysBtn = saveBtn;
                this.saveKeysBtn.addEventListener('click', () => {
                    console.log('Save keys button clicked (second try)');
                    this.saveApiKeys();
                });
            }
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

        // Listen for popup close events
        window.addEventListener('beforeunload', (event) => {
            if (this.isAnalyzing) {
                console.log('Popup closing during analysis, showing confirmation');
                const confirmed = this.showCloseConfirmation();
                if (!confirmed) {
                    event.preventDefault();
                    event.returnValue = '';
                }
            }
        });

        // Listen for visibility change (when user switches tabs)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && this.isAnalyzing) {
                console.log('Popup becoming hidden during analysis');
                // Optionally show a notification or continue analysis in background
                this.sendContinueAnalysisMessage();
            }
        });

        // Listen for window focus/blur events
        window.addEventListener('blur', () => {
            if (this.isAnalyzing) {
                console.log('Popup losing focus during analysis');
                // Continue analysis in background
                this.sendContinueAnalysisMessage();
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

        // Add function to test save button click
        window.testSaveButton = () => {
            console.log('Testing save button click...');
            if (this.saveKeysBtn) {
                console.log('Triggering save button click');
                this.saveKeysBtn.click();
            } else {
                console.log('Save button not found, calling saveApiKeys directly');
                this.saveApiKeys();
            }
        };

        // Add function to check all elements
        window.checkElements = () => {
            console.log('=== Element Check ===');
            console.log('saveKeysBtn:', !!this.saveKeysBtn);
            console.log('openaiKeyInput:', !!this.openaiKeyInput);
            console.log('redditClientIdInput:', !!this.redditClientIdInput);
            console.log('redditClientSecretInput:', !!this.redditClientSecretInput);
            
            const saveBtnInDOM = document.getElementById('saveKeysBtn');
            console.log('saveKeysBtn in DOM:', !!saveBtnInDOM);
            
            if (saveBtnInDOM) {
                console.log('Save button properties:', {
                    textContent: saveBtnInDOM.textContent,
                    disabled: saveBtnInDOM.disabled,
                    onclick: saveBtnInDOM.onclick,
                    className: saveBtnInDOM.className
                });
            }
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
        console.log('=== Starting Analysis ===');
        this.isAnalyzing = true; // Set analyzing state
        this.updateStatus('🔍 Analyzing Reddit post...', 'loading');
        
        try {
            // Get current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('Current tab:', tab.url);
            
            if (!tab.url || !tab.url.includes('reddit.com')) {
                this.updateStatus('❌ Please navigate to a Reddit post page', 'error');
                this.isAnalyzing = false; // Reset state
                return;
            }

            console.log('Checking if content script is loaded...');
            
            // First, try to check if content script is loaded
            try {
                const statusResponse = await chrome.tabs.sendMessage(tab.id, {
                    action: 'checkStatus'
                });
                console.log('Content script status response:', statusResponse);
            } catch (error) {
                console.error('Content script not loaded, attempting to inject...');
                
                // Try to inject the content script
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });
                    console.log('Content script injected successfully');
                    
                    // Wait a moment for the script to initialize
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (injectError) {
                    console.error('Failed to inject content script:', injectError);
                    this.updateStatus('❌ Failed to load extension on this page. Please refresh the page and try again.', 'error');
                    this.isAnalyzing = false;
                    return;
                }
            }

            console.log('Sending API keys to content script...');
            // Send API keys to content script
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'setApiKeys',
                    openaiKey: this.apiKeys.openaiKey,
                    redditClientId: this.apiKeys.redditClientId,
                    redditClientSecret: this.apiKeys.redditClientSecret
                });
                console.log('API keys sent successfully');
            } catch (error) {
                console.error('Failed to send API keys:', error);
                this.updateStatus('❌ Failed to communicate with page. Please refresh and try again.', 'error');
                this.isAnalyzing = false;
                return;
            }

            console.log('Sending analyze request to content script...');
            // Send analyze request
            try {
                const response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'analyze',
                    url: tab.url
                });

                console.log('Received response from content script:', response);
                if (response && response.success) {
                    this.displaySummary(response.summary, response.data);
                    this.updateStatus('✅ Analysis complete!', 'success');
                } else {
                    const errorMsg = response ? response.error : 'Unknown error occurred';
                    this.updateStatus(`❌ Error: ${errorMsg}`, 'error');
                }
            } catch (error) {
                console.error('Failed to send analyze request:', error);
                this.updateStatus('❌ Failed to start analysis. Please refresh the page and try again.', 'error');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            this.updateStatus(`❌ Error: ${error.message}`, 'error');
        } finally {
            this.isAnalyzing = false; // Reset state
            console.log('=== Analysis Complete ===');
        }
    }

    // Show confirmation dialog when user tries to close during analysis
    showCloseConfirmation() {
        if (!this.isAnalyzing) {
            return true; // Allow closing if not analyzing
        }

        const confirmed = confirm(
            '🤔 Analysis in Progress\n\n' +
            'You have an analysis running. Are you sure you want to close the popup?\n\n' +
            '• The analysis will continue in the background\n' +
            '• You can reopen the popup to see results\n' +
            '• Click "Cancel" to keep the popup open'
        );

        if (confirmed) {
            console.log('User confirmed closing popup during analysis');
            // Optionally send a message to content script to continue analysis
            this.sendContinueAnalysisMessage();
        }

        return confirmed;
    }

    // Send message to content script to continue analysis in background
    async sendContinueAnalysisMessage() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url && tab.url.includes('reddit.com')) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'continueAnalysisInBackground'
                });
            }
        } catch (error) {
            console.error('Error sending continue analysis message:', error);
        }
    }

    // Check for existing analysis results
    async checkForExistingResults() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url && tab.url.includes('reddit.com')) {
                const response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'checkForResults'
                });
                
                if (response && response.hasResults) {
                    console.log('Found existing analysis results');
                    this.displaySummary(response.summary, response.data);
                    this.updateStatus('✅ Previous analysis results loaded', 'success');
                }
            }
        } catch (error) {
            console.error('Error checking for existing results:', error);
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

    // Test function to check if content script is loaded
    async testContentScriptConnection() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('Testing connection to tab:', tab.url);
            
            if (!tab.url || !tab.url.includes('reddit.com')) {
                console.log('Not on Reddit page');
                return false;
            }
            
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'checkStatus'
            });
            
            console.log('Content script connection test successful:', response);
            return true;
        } catch (error) {
            console.error('Content script connection test failed:', error);
            return false;
        }
    }

    // Add test button to popup for debugging
    addTestButton() {
        const testBtn = document.createElement('button');
        testBtn.textContent = 'Test Connection';
        testBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 1000; padding: 5px; background: #ff6b6b; color: white; border: none; border-radius: 3px; cursor: pointer;';
        testBtn.onclick = async () => {
            const isConnected = await this.testContentScriptConnection();
            alert(isConnected ? '✅ Content script is loaded!' : '❌ Content script not found. Please refresh the page.');
        };
        document.body.appendChild(testBtn);
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - creating PopupController');
    new PopupController();
}); 