/**
 * File Handler Utility
 * Handles JSON export/import and file validation
 */

/**
 * Generate filename for export
 * @returns {string} - Filename with current date
 */
function generateExportFilename() {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `youtube-subscriptions-${dateStr}.json`;
}

/**
 * Format subscription data for export
 * @param {Array<Object>} subscriptions - Array of subscription objects
 * @returns {Object} - Formatted export data
 */
function formatExportData(subscriptions) {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    source: 'YouTube Subporter',
    totalSubscriptions: subscriptions.length,
    subscriptions: subscriptions
  };
}

/**
 * Download JSON file
 * @param {Object} data - Data to export
 * @param {string} filename - Filename for download
 * @returns {Promise<void>}
 */
async function downloadJSON(data, filename) {
  try {
    // Convert data to JSON string with formatting
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Trigger download via chrome.downloads API
    await chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    });

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    console.log('Export file downloaded:', filename);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

/**
 * Validate JSON structure for import
 * @param {Object} data - Parsed JSON data
 * @returns {Object} - Validation result: { valid: boolean, error?: string, data?: Object }
 */
function validateImportJSON(data) {
  try {
    // Check if data exists
    if (!data) {
      return {
        valid: false,
        error: 'No data provided'
      };
    }

    // Check required fields
    if (!data.subscriptions || !Array.isArray(data.subscriptions)) {
      return {
        valid: false,
        error: 'Invalid format: missing or invalid "subscriptions" array'
      };
    }

    // Check if subscriptions array is empty
    if (data.subscriptions.length === 0) {
      return {
        valid: false,
        error: 'No subscriptions found in file'
      };
    }

    // Validate each subscription object
    const invalidSubscriptions = [];
    const validSubscriptions = [];

    data.subscriptions.forEach((sub, index) => {
      // Check required fields for each subscription
      const hasChannelId = sub.channelId && typeof sub.channelId === 'string';
      const hasChannelUrl = sub.channelUrl && typeof sub.channelUrl === 'string';
      const hasChannelName = sub.channelName && typeof sub.channelName === 'string';

      // Need at least channelId or channelUrl
      if ((!hasChannelId && !hasChannelUrl) || !hasChannelName) {
        invalidSubscriptions.push({
          index,
          subscription: sub,
          reason: 'Missing required fields (channelId/channelUrl or channelName)'
        });
      } else {
        validSubscriptions.push(sub);
      }
    });

    // If there are invalid subscriptions, warn but continue with valid ones
    if (invalidSubscriptions.length > 0) {
      console.warn('Invalid subscriptions found:', invalidSubscriptions);
    }

    // If no valid subscriptions remain, fail validation
    if (validSubscriptions.length === 0) {
      return {
        valid: false,
        error: 'No valid subscriptions found in file'
      };
    }

    return {
      valid: true,
      data: {
        ...data,
        subscriptions: validSubscriptions,
        totalSubscriptions: validSubscriptions.length,
        invalidCount: invalidSubscriptions.length
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: `Validation error: ${error.message}`
    };
  }
}

/**
 * Read and parse JSON file
 * @param {File} file - File object from input
 * @returns {Promise<Object>} - Parsed JSON data
 */
function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Compare two subscription lists
 * @param {Array<Object>} list1 - First subscription list
 * @param {Array<Object>} list2 - Second subscription list
 * @returns {Object} - Comparison results
 */
function compareSubscriptionLists(list1, list2) {
  const list1Ids = new Set(list1.map(sub => sub.channelId).filter(Boolean));
  const list2Ids = new Set(list2.map(sub => sub.channelId).filter(Boolean));

  const onlyInList1 = list1.filter(sub => sub.channelId && !list2Ids.has(sub.channelId));
  const onlyInList2 = list2.filter(sub => sub.channelId && !list1Ids.has(sub.channelId));
  const inBoth = list1.filter(sub => sub.channelId && list2Ids.has(sub.channelId));

  return {
    onlyInList1,
    onlyInList2,
    inBoth,
    list1Count: list1.length,
    list2Count: list2.length,
    uniqueInList1: onlyInList1.length,
    uniqueInList2: onlyInList2.length,
    common: inBoth.length
  };
}

/**
 * Merge multiple subscription lists (remove duplicates)
 * @param {Array<Array<Object>>} lists - Array of subscription lists
 * @returns {Array<Object>} - Merged and deduplicated list
 */
function mergeSubscriptionLists(lists) {
  const seenIds = new Set();
  const merged = [];

  lists.forEach(list => {
    list.forEach(sub => {
      if (sub.channelId && !seenIds.has(sub.channelId)) {
        seenIds.add(sub.channelId);
        merged.push(sub);
      }
    });
  });

  return merged;
}

/**
 * Filter subscriptions based on criteria
 * @param {Array<Object>} subscriptions - Subscription list
 * @param {Object} filters - Filter criteria
 * @returns {Array<Object>} - Filtered list
 */
function filterSubscriptions(subscriptions, filters) {
  let filtered = [...subscriptions];

  // Filter by keyword in channel name
  if (filters.keyword && filters.keyword.trim()) {
    const keyword = filters.keyword.toLowerCase();
    filtered = filtered.filter(sub =>
      sub.channelName?.toLowerCase().includes(keyword) ||
      sub.channelHandle?.toLowerCase().includes(keyword)
    );
  }

  // Filter by subscriber count (requires parsing "15.2M" format)
  if (filters.minSubscribers || filters.maxSubscribers) {
    filtered = filtered.filter(sub => {
      const count = parseSubscriberCount(sub.subscriberCount);
      if (filters.minSubscribers && count < filters.minSubscribers) return false;
      if (filters.maxSubscribers && count > filters.maxSubscribers) return false;
      return true;
    });
  }

  // Filter by custom selection (array of channel IDs)
  if (filters.selectedChannels && Array.isArray(filters.selectedChannels)) {
    const selectedSet = new Set(filters.selectedChannels);
    filtered = filtered.filter(sub => selectedSet.has(sub.channelId));
  }

  return filtered;
}

/**
 * Parse subscriber count string to number
 * @param {string} countStr - Subscriber count string (e.g., "15.2M", "500K")
 * @returns {number} - Parsed number
 */
function parseSubscriberCount(countStr) {
  if (!countStr || typeof countStr !== 'string') return 0;

  const cleanStr = countStr.replace(/[,\s]/g, '').toUpperCase();

  let multiplier = 1;
  if (cleanStr.includes('M')) {
    multiplier = 1000000;
  } else if (cleanStr.includes('K')) {
    multiplier = 1000;
  }

  const number = parseFloat(cleanStr.replace(/[MK]/g, ''));
  return isNaN(number) ? 0 : number * multiplier;
}

// Export functions
if (typeof window !== 'undefined') {
  window.FileHandler = {
    generateExportFilename,
    formatExportData,
    downloadJSON,
    validateImportJSON,
    readJSONFile,
    compareSubscriptionLists,
    mergeSubscriptionLists,
    filterSubscriptions,
    parseSubscriberCount
  };
}
