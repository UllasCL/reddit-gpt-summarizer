# Reddit GPT Summarizer - Chrome Extension

A Chrome extension that uses **Reddit API** to collect all post information and **OpenAI API** to generate intelligent summaries - everything runs in the browser with secure API key storage and smart post detection!

## 🚀 Features

- **🔑 Secure Setup Wizard**: Guided API key configuration on first use
- **🔒 Secure Storage**: API keys stored locally in browser storage
- **🎯 Smart Post Detection**: Automatically detects Reddit posts and shows helpful popup
- **📱 Beautiful Notifications**: Elegant popup notifications on Reddit post pages
- **Reddit API Integration**: Fetches complete post data including all comments
- **OpenAI AI Summarization**: Generates comprehensive summaries using GPT models
- **Complete Comment Analysis**: Gets all comments, not just visible ones
- **Beautiful UI**: Modern, responsive popup interface with setup wizard
- **Real-time Stats**: Shows comment count, word count, and processing time

## 📁 File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Reddit API and OpenAI integration
├── popup.html           # Popup UI with setup wizard
├── popup.js             # Popup logic and secure storage
├── README.md            # This file
└── icons/               # Extension icons (create your own)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🛠️ Installation

### 1. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder

### 2. Create Icons (Optional)

Create icon files in the `chrome-extension` folder:
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)  
- `icon128.png` (128x128 pixels)

## 🔑 First-Time Setup

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Create a new API key
4. Copy the key (starts with `sk-`)

### 2. Get Reddit API Credentials

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Fill in the details:
   - **Name**: Reddit GPT Summarizer
   - **Type**: Script
   - **Description**: Chrome extension for analyzing Reddit posts
   - **About URL**: (leave blank)
   - **Redirect URI**: `http://localhost:8080`
4. Click "Create App"
5. Copy the **Client ID** (under the app name)
6. Copy the **Client Secret** (click "Show Secret")

### 3. Configure Extension

1. Click the extension icon
2. You'll see the setup wizard
3. Enter your API keys:
   - **OpenAI API Key**: Your `sk-...` key
   - **Reddit Client ID**: Your Reddit app client ID
   - **Reddit Client Secret**: Your Reddit app client secret
4. Click "💾 Save & Continue"
5. Your keys are now securely stored!

## 🎯 Usage

### 1. Smart Post Detection

Once configured, the extension will:
- **Automatically detect** when you visit Reddit post pages
- **Show a beautiful popup** with information about the extension
- **Offer to analyze** the current post with one click
- **Auto-dismiss** after 10 seconds if not used

### 2. Analyze Reddit Posts

1. Navigate to any Reddit post page
2. **Option A**: Click the popup notification that appears
3. **Option B**: Click the extension icon manually
4. Click "🚀 Analyze Reddit Post"
5. Wait for the AI-powered analysis!

### 3. Reconfigure API Keys

1. Click the extension icon
2. Click "⚙️ Configure API Keys"
3. Update your API keys
4. Click "💾 Save & Continue"

## 🔍 How It Works

### 1. Smart Detection (`content.js`)
- Detects when user visits Reddit post pages
- Checks if extension is properly configured
- Shows elegant notification popup
- Handles SPA navigation (Reddit's dynamic loading)

### 2. Setup Wizard (`popup.js`)
- Checks if user has configured API keys
- Shows guided setup on first use
- Securely stores keys in Chrome storage
- Validates API key formats

### 3. Reddit API Integration (`content.js`)
- Uses Reddit OAuth to get access token
- Fetches complete post data via Reddit API
- Extracts all comments (not just visible ones)
- Handles nested comment threads

### 4. OpenAI Integration (`content.js`)
- Sends formatted data to OpenAI API
- Uses GPT-3.5-turbo for intelligent analysis
- Generates comprehensive summaries
- Focuses on key points and sentiment

### 5. Secure Storage (`popup.js`)
- API keys stored in Chrome's local storage
- Keys persist between browser sessions
- No external data transmission
- Complete privacy protection

### 6. Background Service (`background.js`)
- Handles extension status checks
- Manages communication between components
- Monitors tab updates for Reddit posts
- Provides seamless user experience

## 🎨 Customization

### API Configuration
- Change OpenAI model in `content.js`
- Modify Reddit API parameters
- Adjust summary length and style

### UI Customization
Edit `popup.html` and `content.js` to customize:
- Setup wizard appearance
- Notification popup design
- Colors and gradients
- Layout and spacing
- Button styles and animations

## 🔒 Security & Privacy

- **🔐 Local Storage**: API keys stored in browser only
- **🛡️ No Backend**: Everything runs client-side
- **🔑 Secure APIs**: Uses official Reddit and OpenAI APIs
- **📱 No Data Collection**: No data sent to third parties
- **✅ Key Validation**: Validates API key formats
- **🔄 Persistent Storage**: Keys saved securely between sessions

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid OpenAI API key format"**
   - Ensure your OpenAI key starts with `sk-`
   - Check for extra spaces or characters
   - Verify the key is from OpenAI platform

2. **"Reddit API error"**
   - Check your Reddit Client ID and Secret
   - Ensure Reddit app is configured as "Script"
   - Verify app is not in development mode

3. **"OpenAI API error"**
   - Verify your OpenAI API key is correct
   - Check your OpenAI account has credits
   - Ensure API key has proper permissions

4. **"Invalid Reddit URL"**
   - Make sure you're on a Reddit post page
   - URL should contain `/comments/`
   - Try refreshing the page

5. **"Popup not showing"**
   - Ensure extension is properly configured
   - Check if you're on a Reddit post page
   - Try refreshing the page
   - Check browser console for errors

### Debug Mode

1. Open Chrome DevTools
2. Go to the Console tab
3. Look for extension logs
4. Check for API error messages

## 📈 Performance

- Fast Reddit API calls
- Efficient comment parsing
- Optimized OpenAI requests
- Minimal memory usage
- Progressive loading states
- Smart popup timing

## 🚀 Deployment

### For Development
1. Load as unpacked extension
2. Make changes to files
3. Click "Reload" in chrome://extensions/

### For Production
1. Create a ZIP file of the extension
2. Submit to Chrome Web Store
3. Or distribute the ZIP file directly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source. Feel free to modify and distribute.

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify API keys are correct
3. Test with different Reddit posts
4. Check browser console for errors

---

**Happy Summarizing! 🎉** 