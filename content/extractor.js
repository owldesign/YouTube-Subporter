/**
 * Extractor Content Script
 * Extracts subscription data from YouTube subscriptions page
 * This script is injected into youtube.com/feed/channels
 */

// Only initialize once to avoid redeclaration errors
if (window.YTSubporterExtractor) {
  console.log('Extractor already loaded');
} else {
  window.YTSubporterExtractor = true;

// Import helpers (will be loaded via manifest content_scripts)
const { SELECTORS, findElement, findAllElements, sleep } = window.YouTubeHelpers || {};

/**
 * Scroll page to load all subscriptions (lazy loading)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<number>} - Total number of subscriptions loaded
 */
async function scrollToLoadAll(onProgress) {
  console.log('Starting scroll to load all subscriptions...');

  let lastHeight = 0;
  let noChangeCount = 0;
  const maxAttempts = 100; // Increased for larger subscription counts
  const scrollDelay = 1000; // 1 second between scrolls

  for (let i = 0; i < maxAttempts; i++) {
    // Scroll to bottom
    window.scrollTo(0, document.documentElement.scrollHeight);

    // Wait for content to load
    await sleep(scrollDelay);

    // Get current height
    const newHeight = document.documentElement.scrollHeight;

    // Count current channels
    const channelElements = findAllElements(SELECTORS.channelRenderer);
    const currentCount = channelElements.length;

    // Report progress
    if (onProgress && typeof onProgress === 'function') {
      onProgress({
        type: 'scroll_progress',
        currentCount,
        attempt: i + 1,
        maxAttempts
      });
    }

    console.log(`Scroll attempt ${i + 1}: Found ${currentCount} channels`);

    // Check if height changed
    if (newHeight === lastHeight) {
      noChangeCount++;
      console.log(`No height change detected (${noChangeCount}/3)`);

      // If no change detected 3 times, assume we've loaded everything
      if (noChangeCount >= 3) {
        console.log('All subscriptions loaded');
        break;
      }
    } else {
      noChangeCount = 0;
    }

    lastHeight = newHeight;
  }

  // Final count
  const finalElements = findAllElements(SELECTORS.channelRenderer);
  console.log(`Scrolling complete. Total channels found: ${finalElements.length}`);

  return finalElements.length;
}

/**
 * Extract channel ID from element
 * @param {Element} elem - Channel renderer element
 * @returns {string|null} - Channel ID or null
 */
function extractChannelId(elem) {
  // Try to find channel ID from link href
  const link = findElement(SELECTORS.channelLink, elem);
  if (link) {
    const href = link.getAttribute('href');
    if (href) {
      // Extract from /channel/UCxxxxxx format
      const match = href.match(/\/channel\/(UC[\w-]{22})/);
      if (match) {
        return match[1];
      }

      // For handle-based URLs, try to extract from page data
      const handleMatch = href.match(/\/@([\w-]+)/);
      if (handleMatch) {
        // Store handle, we'll need to resolve to channel ID later if needed
        return `@${handleMatch[1]}`;
      }
    }
  }

  return null;
}

/**
 * Extract channel name from element
 * @param {Element} elem - Channel renderer element
 * @returns {string|null} - Channel name or null
 */
function extractChannelName(elem) {
  const nameElem = findElement(SELECTORS.channelName, elem);
  return nameElem ? nameElem.textContent.trim() : null;
}

/**
 * Extract channel handle from element
 * @param {Element} elem - Channel renderer element
 * @returns {string|null} - Channel handle or null
 */
function extractChannelHandle(elem) {
  const handleElem = findElement(SELECTORS.channelHandle, elem);
  return handleElem ? handleElem.textContent.trim() : null;
}

/**
 * Extract channel URL from element
 * @param {Element} elem - Channel renderer element
 * @returns {string|null} - Full channel URL or null
 */
function extractChannelUrl(elem) {
  const link = findElement(SELECTORS.channelLink, elem);
  if (link) {
    const href = link.getAttribute('href');
    if (href) {
      // Convert relative URL to absolute
      if (href.startsWith('/')) {
        return `https://www.youtube.com${href}`;
      }
      return href;
    }
  }
  return null;
}

/**
 * Extract channel thumbnail URL from element
 * @param {Element} elem - Channel renderer element
 * @returns {string|null} - Thumbnail URL or null
 */
function extractChannelThumbnail(elem) {
  const img = findElement(SELECTORS.channelThumbnail, elem);
  return img ? img.src : null;
}

/**
 * Extract subscriber count from element
 * @param {Element} elem - Channel renderer element
 * @returns {string|null} - Subscriber count string or null
 */
function extractSubscriberCount(elem) {
  const countElem = findElement(SELECTORS.subscriberCount, elem);
  return countElem ? countElem.textContent.trim() : null;
}

/**
 * Extract all subscription data from a channel element
 * @param {Element} elem - Channel renderer element
 * @returns {Object|null} - Subscription data or null
 */
function extractSubscriptionData(elem) {
  try {
    const channelId = extractChannelId(elem);
    const channelName = extractChannelName(elem);
    const channelUrl = extractChannelUrl(elem);

    // Require at least name and URL
    if (!channelName || !channelUrl) {
      console.warn('Skipping channel: missing required data', { channelName, channelUrl });
      return null;
    }

    return {
      channelId,
      channelName,
      channelHandle: extractChannelHandle(elem),
      channelUrl,
      thumbnailUrl: extractChannelThumbnail(elem),
      subscriberCount: extractSubscriberCount(elem),
      extractedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error extracting subscription data:', error);
    return null;
  }
}

/**
 * Main extraction function
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array<Object>>} - Array of subscription objects
 */
async function extractAllSubscriptions(onProgress) {
  try {
    console.log('Starting extraction process...');

    // Step 1: Scroll to load all subscriptions
    if (onProgress) {
      onProgress({ type: 'status', message: 'Loading all subscriptions...' });
    }

    await scrollToLoadAll(onProgress);

    // Step 2: Extract data from all channel elements
    if (onProgress) {
      onProgress({ type: 'status', message: 'Extracting channel data...' });
    }

    const channelElements = findAllElements(SELECTORS.channelRenderer);
    console.log(`Found ${channelElements.length} channel elements to extract`);

    const subscriptions = [];
    let extracted = 0;

    for (let i = 0; i < channelElements.length; i++) {
      const elem = channelElements[i];
      const data = extractSubscriptionData(elem);

      if (data) {
        subscriptions.push(data);
        extracted++;
      }

      // Report progress every 10 channels
      if (onProgress && (i + 1) % 10 === 0) {
        onProgress({
          type: 'extract_progress',
          extracted,
          total: channelElements.length,
          current: i + 1
        });
      }
    }

    console.log(`Extraction complete. Extracted ${subscriptions.length} subscriptions`);

    if (onProgress) {
      onProgress({
        type: 'complete',
        total: subscriptions.length
      });
    }

    return subscriptions;

  } catch (error) {
    console.error('Error during extraction:', error);
    throw error;
  }
}

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTRACT_SUBSCRIPTIONS') {
    console.log('Received extraction request');

    // Run extraction and send progress updates
    extractAllSubscriptions((progress) => {
      // Send progress updates back to service worker
      chrome.runtime.sendMessage({
        type: 'EXTRACT_PROGRESS',
        progress
      });
    })
      .then(subscriptions => {
        console.log('Sending extracted subscriptions back to service worker');
        sendResponse({
          success: true,
          subscriptions,
          count: subscriptions.length
        });
      })
      .catch(error => {
        console.error('Extraction failed:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });

    // Return true to indicate we'll send response asynchronously
    return true;
  }
});

console.log('Extractor content script loaded');

} // End of initialization check
