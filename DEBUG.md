# Debugging Guide

## Quick Fix for "Receiving end does not exist" Error

This error means the service worker (background script) isn't running. Here's how to fix it:

### Step 1: Reload the Extension

1. Go to `chrome://extensions/`
2. Find "YouTube Subporter"
3. Click the **refresh icon (🔄)**
4. Check for any errors (red badges)

### Step 2: Check Service Worker Status

1. On `chrome://extensions/`, find "YouTube Subporter"
2. Click "Inspect views: service worker" (this opens DevTools)
3. Look for the console message: `Service worker loaded and ready`
4. If you see errors, note them down

### Step 3: Check for Errors

**In Service Worker DevTools:**
- Look for any red error messages
- Common issues:
  - `importScripts failed` - Script loading error
  - `Unexpected token` - Syntax error
  - `Cannot read property` - Runtime error

**In Popup DevTools:**
1. Right-click the extension icon
2. Select "Inspect popup"
3. Look for console errors
4. Should see: `Service worker connection OK`

### Step 4: Common Fixes

**If service worker won't load:**
```bash
# Navigate to extension directory
cd "/Users/owldesign/Projects/chrome-extensions/YouTube Subporter"

# Check for syntax errors
node -c background/service-worker.js
node -c popup/popup.js
```

**If you get syntax errors:**
- Fix the reported file
- Reload the extension
- Test again

**If no syntax errors but still failing:**
1. Remove the extension completely
2. Restart Chrome
3. Load the extension again

## Testing the Extension

### Test Service Worker

Open a regular webpage and run this in DevTools console:

```javascript
chrome.runtime.sendMessage(
  'YOUR_EXTENSION_ID',
  { type: 'PING' },
  (response) => {
    console.log('Service worker response:', response);
  }
);
```

Replace `YOUR_EXTENSION_ID` with your actual extension ID from `chrome://extensions/`

### Test Export (Manual)

1. Navigate to https://www.youtube.com/feed/channels
2. Open extension popup
3. Open popup DevTools (right-click icon → Inspect popup)
4. Watch console for messages
5. Click "Export to JSON"
6. Check console for:
   - "Starting export process..."
   - Any error messages

### Test Content Scripts

On YouTube subscriptions page, open DevTools console and run:

```javascript
// Check if YouTubeHelpers is loaded
console.log(window.YouTubeHelpers);

// Check if we can find channels
if (window.YouTubeHelpers) {
  const channels = window.YouTubeHelpers.findAllElements(
    window.YouTubeHelpers.SELECTORS.channelRenderer
  );
  console.log('Found channels:', channels.length);
}
```

## Common Issues and Solutions

### Issue: "Could not establish connection. Receiving end does not exist."

**Cause:** Service worker crashed or never loaded

**Solutions:**
1. Reload extension (refresh button on chrome://extensions/)
2. Check service worker console for errors
3. Restart Chrome
4. Reinstall extension

### Issue: Export button does nothing

**Cause:** Not on subscriptions page or service worker issue

**Solutions:**
1. Make sure you're on https://www.youtube.com/feed/channels
2. Check popup console for errors
3. Check service worker console for errors

### Issue: "Subscribe button not found" during import

**Cause:** YouTube DOM has changed or page not loaded

**Solutions:**
1. Increase delay in settings (5-10 seconds)
2. Check if you can manually subscribe to the channel
3. Check console for selector errors

### Issue: Import is very slow

**Cause:** Conservative default settings

**Solutions:**
1. Open Settings panel
2. Reduce "Delay between subscriptions" to 2 seconds
3. Increase "Batch size" to 20-30
4. Click "Save Settings"
5. Start import again

## Manual Testing Checklist

- [ ] Extension loads without errors in chrome://extensions/
- [ ] Service worker console shows "Service worker loaded and ready"
- [ ] Popup opens when clicking extension icon
- [ ] Popup console shows "Service worker connection OK"
- [ ] Settings panel opens/closes correctly
- [ ] Sliders update values in real-time
- [ ] File picker opens when clicking "Choose JSON File"
- [ ] On subscriptions page, "Export to JSON" button works
- [ ] Downloaded JSON file is valid and contains subscriptions
- [ ] Import can read the JSON file
- [ ] Import shows preview (channel count)
- [ ] "Start Import" button becomes visible after file selection

## Get Extension ID

Your extension ID can be found on chrome://extensions/ - it's the long string of letters under the extension name.

Example: `abcdefghijklmnopqrstuvwxyz123456`

## Reporting Bugs

If you encounter issues:

1. **Collect information:**
   - Chrome version: chrome://version/
   - Extension version: Check manifest.json
   - Service worker console output (screenshot)
   - Popup console output (screenshot)
   - Steps to reproduce

2. **Create detailed report:**
   - What were you trying to do?
   - What did you expect to happen?
   - What actually happened?
   - Can you reproduce it consistently?

## Advanced Debugging

### Enable Verbose Logging

Add this at the top of service-worker.js:

```javascript
const DEBUG = true;
function log(...args) {
  if (DEBUG) console.log('[SW]', ...args);
}
```

Then replace `console.log` with `log` throughout the file.

### Monitor All Messages

In popup DevTools console:

```javascript
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Popup received message:', msg);
  return false;
});
```

In service worker DevTools console:

```javascript
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('SW received message:', msg);
  return false;
});
```

### Check Storage

In any DevTools console:

```javascript
chrome.storage.local.get(null, (data) => {
  console.log('All storage:', data);
});
```

## Still Having Issues?

1. Check that all files are present:
   ```bash
   cd "/Users/owldesign/Projects/chrome-extensions/YouTube Subporter"
   find . -type f | sort
   ```

2. Verify no hidden characters or encoding issues:
   ```bash
   file background/service-worker.js
   file popup/popup.js
   ```

3. Check file permissions:
   ```bash
   ls -la background/service-worker.js
   ls -la popup/popup.js
   ```

All files should be readable (have 'r' permission).
