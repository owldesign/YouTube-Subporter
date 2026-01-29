/**
 * Service Worker (Background Script)
 * Orchestrates export/import operations and manages messaging
 */

// Note: We can't use importScripts with our utils since they reference 'window'
// Instead, we'll implement the needed functions directly here

// Import state
let importState = {
  isRunning: false,
  isPaused: false,
  currentIndex: 0,
  subscriptions: [],
  results: {
    success: [],
    failed: [],
    skipped: []
  }
};

/**
 * Get active YouTube tab
 * @returns {Promise<Tab|null>} - Active tab or null
 */
async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0] || null;
}

/**
 * Check if tab is on YouTube
 * @param {Tab} tab - Tab object
 * @returns {boolean} - True if on YouTube
 */
function isYouTubeTab(tab) {
  return tab && tab.url && tab.url.includes('youtube.com');
}

/**
 * Inject content scripts into tab
 * @param {number} tabId - Tab ID
 * @param {Array<string>} files - Array of file paths to inject
 * @returns {Promise<void>}
 */
async function injectScripts(tabId, files) {
  for (const file of files) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: [file]
      });
    } catch (error) {
      console.error(`Error injecting script ${file}:`, error);
      throw error;
    }
  }
}

/**
 * Handle export request
 * @param {number} tabId - Tab ID
 * @param {Tab} tab - Tab object
 * @returns {Promise<Object>} - Result
 */
async function handleExportRequest(tabId, tab) {
  try {
    console.log('Starting export process...');

    // Verify we're on YouTube subscriptions page
    if (!tab.url.includes('/feed/channels')) {
      return {
        success: false,
        error: 'Please navigate to YouTube subscriptions page (youtube.com/feed/channels)'
      };
    }

    // Inject required scripts
    await injectScripts(tabId, [
      'utils/youtube-helpers.js',
      'content/extractor.js'
    ]);

    // Send extraction request to content script
    const response = await chrome.tabs.sendMessage(tabId, {
      type: 'EXTRACT_SUBSCRIPTIONS'
    });

    if (response.success) {
      console.log(`Export successful: ${response.count} subscriptions`);

      // Format data for export
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        source: 'YouTube Subporter',
        totalSubscriptions: response.subscriptions.length,
        subscriptions: response.subscriptions
      };

      // Save to storage (for comparison features)
      await chrome.storage.local.set({ lastExport: exportData });

      return {
        success: true,
        data: exportData,
        count: response.count
      };
    } else {
      return {
        success: false,
        error: response.error || 'Export failed'
      };
    }

  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Handle import request
 * @param {Array<Object>} subscriptions - Subscriptions to import
 * @param {Object} settings - User settings
 * @returns {Promise<Object>} - Results
 */
async function handleImportRequest(subscriptions, settings) {
  try {
    console.log(`Starting import of ${subscriptions.length} subscriptions...`);

    // Initialize state
    importState = {
      isRunning: true,
      isPaused: false,
      currentIndex: 0,
      subscriptions,
      results: {
        success: [],
        failed: [],
        skipped: []
      },
      settings
    };

    // Save initial state
    await chrome.storage.local.set({ importState: 'running' });

    // Get active tab
    const tab = await getActiveTab();
    if (!tab) {
      throw new Error('No active tab found');
    }

    // Process each subscription
    for (let i = 0; i < subscriptions.length; i++) {
      // Check if paused or cancelled
      const state = await chrome.storage.local.get('importState');
      if (state.importState === 'paused') {
        console.log('Import paused');
        importState.isPaused = true;
        importState.currentIndex = i;
        await chrome.storage.local.set({ importProgress: importState });
        return { paused: true, progress: importState };
      }

      if (state.importState === 'cancelled') {
        console.log('Import cancelled');
        importState.isRunning = false;
        return { cancelled: true, results: importState.results };
      }

      const channel = subscriptions[i];
      importState.currentIndex = i;

      console.log(`Processing ${i + 1}/${subscriptions.length}: ${channel.channelName}`);

      try {
        // Navigate to channel page
        await chrome.tabs.update(tab.id, { url: channel.channelUrl });

        // Wait for page to load
        await sleep(2000);

        // Inject scripts
        await injectScripts(tab.id, [
          'utils/youtube-helpers.js',
          'content/subscriber.js'
        ]);

        // Send subscribe request
        const response = await chrome.tabs.sendMessage(tab.id, {
          type: 'SUBSCRIBE_TO_CHANNEL',
          channelData: channel
        });

        // Process result
        if (response.success && response.result) {
          const result = response.result;

          if (result.status === 'success') {
            importState.results.success.push(channel);
          } else if (result.status === 'skipped') {
            importState.results.skipped.push(channel);
          } else {
            importState.results.failed.push({ channel, error: result.message });
          }
        } else {
          importState.results.failed.push({ channel, error: 'Unknown error' });
        }

      } catch (error) {
        console.error(`Error subscribing to ${channel.channelName}:`, error);
        importState.results.failed.push({ channel, error: error.message });
      }

      // Send progress update to popup
      chrome.runtime.sendMessage({
        type: 'IMPORT_PROGRESS',
        progress: {
          currentIndex: i + 1,
          total: subscriptions.length,
          currentChannel: channel.channelName,
          results: importState.results
        }
      }).catch(() => {
        // Popup might be closed, ignore error
      });

      // Apply delay before next subscription
      await sleep(settings.delayBetweenSubs);

      // Apply batch pause if needed
      if ((i + 1) % settings.batchSize === 0 && i + 1 < subscriptions.length) {
        console.log(`Batch pause: ${settings.batchPauseDuration}ms`);
        await sleep(settings.batchPauseDuration);
      }
    }

    // Import complete
    importState.isRunning = false;
    await chrome.storage.local.set({ importState: 'completed' });
    await chrome.storage.local.remove('importProgress');

    console.log('Import complete:', importState.results);

    return {
      success: true,
      results: importState.results,
      summary: {
        total: subscriptions.length,
        succeeded: importState.results.success.length,
        failed: importState.results.failed.length,
        skipped: importState.results.skipped.length
      }
    };

  } catch (error) {
    console.error('Import error:', error);
    importState.isRunning = false;
    await chrome.storage.local.set({ importState: 'idle' });

    return {
      success: false,
      error: error.message,
      results: importState.results
    };
  }
}

/**
 * Resume paused import
 * @returns {Promise<Object>} - Results
 */
async function handleResumeImport() {
  const progress = await chrome.storage.local.get('importProgress');

  if (!progress.importProgress) {
    return { success: false, error: 'No import in progress to resume' };
  }

  importState = progress.importProgress;
  importState.isPaused = false;

  await chrome.storage.local.set({ importState: 'running' });

  // Continue from current index
  const remainingSubscriptions = importState.subscriptions.slice(importState.currentIndex);

  return handleImportRequest(remainingSubscriptions, importState.settings);
}

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Service worker received message:', message.type);

  switch (message.type) {
    case 'PING':
      sendResponse({ success: true, message: 'pong' });
      return false;

    case 'EXPORT_START':
      getActiveTab()
        .then(tab => {
          if (!tab || !isYouTubeTab(tab)) {
            return { success: false, error: 'Please open a YouTube tab' };
          }
          return handleExportRequest(tab.id, tab);
        })
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Async response

    case 'IMPORT_START':
      handleImportRequest(message.subscriptions, message.settings)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'IMPORT_PAUSE':
      chrome.storage.local.set({ importState: 'paused' })
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'IMPORT_RESUME':
      handleResumeImport()
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'IMPORT_CANCEL':
      chrome.storage.local.set({ importState: 'cancelled' })
        .then(() => {
          importState.isRunning = false;
          sendResponse({ success: true });
        })
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'GET_IMPORT_STATE':
      chrome.storage.local.get(['importState', 'importProgress'])
        .then(result => sendResponse({
          state: result.importState || 'idle',
          progress: result.importProgress || null
        }))
        .catch(error => sendResponse({ error: error.message }));
      return true;

    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Service worker lifecycle events
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);

  // Initialize default settings on install
  if (details.reason === 'install') {
    chrome.storage.local.set({
      settings: {
        delayBetweenSubs: 3000,
        batchSize: 10,
        batchPauseDuration: 10000
      },
      importState: 'idle'
    });
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup - service worker initialized');
});

console.log('Service worker loaded and ready');
