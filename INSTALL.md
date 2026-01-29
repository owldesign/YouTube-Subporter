# Installation Guide

## Quick Start (Development Mode)

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Or click the puzzle icon → "Manage Extensions"

2. **Enable Developer Mode**
   - Toggle "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to and select the `YouTube Subporter` folder
   - The extension should now appear in your extensions list

4. **Pin the Extension** (Optional but recommended)
   - Click the puzzle icon in Chrome toolbar
   - Find "YouTube Subporter"
   - Click the pin icon to keep it visible

## First Time Setup

1. **Navigate to YouTube**
   - Go to https://www.youtube.com
   - Make sure you're logged in

2. **Test Export**
   - Go to https://www.youtube.com/feed/channels
   - Click the YouTube Subporter icon
   - Click "Export to JSON"
   - Verify the file downloads

3. **Configure Settings** (Optional)
   - Click the YouTube Subporter icon
   - Expand "⚙️ Settings"
   - Adjust rate limiting to your preference
   - Click "Save Settings"

## Updating the Extension

If you make changes to the code:

1. Go to `chrome://extensions/`
2. Find YouTube Subporter
3. Click the refresh icon (🔄)
4. Your changes will be loaded

## Troubleshooting Installation

### Extension doesn't appear after loading

- **Check for errors**: Look for a red error icon on the extension card
- **Verify manifest**: Make sure `manifest.json` is valid JSON
- **Check file paths**: Ensure all files referenced in manifest exist

### Extension loads but popup is blank

- **Open DevTools**: Right-click extension icon → "Inspect popup"
- **Check console**: Look for JavaScript errors
- **Verify popup files**: Ensure `popup/popup.html`, `popup.js`, and `popup.css` exist

### Extension icon is a puzzle piece

- **This is normal**: The placeholder icons are very small
- **Create proper icons**: Replace the files in `icons/` directory with properly designed icons
- **Reload extension**: Click refresh after replacing icons

## Building for Production

When ready to publish to Chrome Web Store:

1. **Update version** in `manifest.json`
2. **Create proper icons** (16x16, 48x48, 128x128)
3. **Test thoroughly** on fresh Chrome profile
4. **Zip the extension**:
   ```bash
   zip -r youtube-subporter.zip . -x "*.git*" -x "*.DS_Store" -x "node_modules/*"
   ```
5. **Upload to Chrome Web Store**: https://chrome.google.com/webstore/devconsole

## System Requirements

- **Browser**: Chrome 88+ or any Chromium-based browser (Edge, Brave, etc.)
- **Manifest Version**: V3
- **Permissions**: activeTab, scripting, storage, downloads
- **Internet**: Required (for YouTube access)

## Next Steps

After installation, see the [README.md](README.md) for usage instructions.
