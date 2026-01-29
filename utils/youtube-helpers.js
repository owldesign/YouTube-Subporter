/**
 * YouTube DOM Selectors and Helper Functions
 * Multiple fallback selectors for robustness against YouTube DOM changes
 */

// Only initialize once to avoid redeclaration errors
if (typeof window !== 'undefined' && window.YouTubeHelpers) {
  console.log('YouTubeHelpers already loaded');
} else {

const SELECTORS = {
  // Channel renderer elements on subscriptions page
  channelRenderer: [
    'ytd-channel-renderer',
    'ytd-grid-channel-renderer',
    '[class*="channel-renderer"]'
  ],

  // Channel name elements
  channelName: [
    'ytd-channel-name yt-formatted-string',
    '#channel-title',
    '[class*="channel-name"]',
    'a#channel-name'
  ],

  // Channel handle (@username)
  channelHandle: [
    '#channel-handle',
    '[class*="channel-handle"]',
    'yt-formatted-string[class*="handle"]'
  ],

  // Channel URL/link
  channelLink: [
    'a#main-link',
    'a[href*="/channel/"]',
    'a[href*="/@"]'
  ],

  // Channel thumbnail
  channelThumbnail: [
    'img#img',
    'yt-img-shadow img',
    '[class*="avatar"] img'
  ],

  // Subscriber count
  subscriberCount: [
    '#subscriber-count',
    '[class*="subscriber-count"]',
    'yt-formatted-string[aria-label*="subscriber"]'
  ],

  // Subscribe button on channel pages
  subscribeButton: [
    'ytd-subscribe-button-renderer button[aria-label*="Subscribe"]',
    'button#subscribe-button',
    'paper-button#subscribe-button',
    'ytd-button-renderer button[aria-label*="Subscribe"]',
    'yt-button-shape button[aria-label*="Subscribe"]'
  ],

  // User avatar (for login detection)
  userAvatar: [
    'ytd-topbar-menu-button-renderer #avatar-btn',
    'button#avatar-btn',
    '[class*="avatar-btn"]'
  ]
};

/**
 * Find element using multiple fallback selectors
 * @param {Array<string>} selectorArray - Array of selectors to try
 * @param {Element} parent - Parent element to search within (default: document)
 * @returns {Element|null} - Found element or null
 */
function findElement(selectorArray, parent = document) {
  for (const selector of selectorArray) {
    try {
      const elem = parent.querySelector(selector);
      if (elem) {
        return elem;
      }
    } catch (e) {
      console.warn(`Invalid selector: ${selector}`, e);
    }
  }
  return null;
}

/**
 * Find all elements using multiple fallback selectors
 * @param {Array<string>} selectorArray - Array of selectors to try
 * @param {Element} parent - Parent element to search within (default: document)
 * @returns {Array<Element>} - Array of found elements
 */
function findAllElements(selectorArray, parent = document) {
  for (const selector of selectorArray) {
    try {
      const elements = parent.querySelectorAll(selector);
      if (elements.length > 0) {
        return Array.from(elements);
      }
    } catch (e) {
      console.warn(`Invalid selector: ${selector}`, e);
    }
  }
  return [];
}

/**
 * Check if user is logged into YouTube
 * @returns {boolean} - True if user is logged in
 */
function isUserLoggedIn() {
  const avatar = findElement(SELECTORS.userAvatar);
  return !!avatar;
}

/**
 * Detect current YouTube page type
 * @returns {string} - Page type: 'subscriptions', 'channel', 'home', 'other'
 */
function getYouTubePageType() {
  const url = window.location.href;

  if (url.includes('/feed/channels')) {
    return 'subscriptions';
  }

  if (url.includes('/channel/') || url.includes('/@')) {
    return 'channel';
  }

  if (url === 'https://www.youtube.com/' || url === 'https://www.youtube.com') {
    return 'home';
  }

  return 'other';
}

/**
 * Extract channel ID from URL
 * @param {string} url - Channel URL
 * @returns {string|null} - Channel ID or null
 */
function extractChannelIdFromUrl(url) {
  if (!url) return null;

  // Match /channel/UCxxxxxx format
  const channelMatch = url.match(/\/channel\/(UC[\w-]{22})/);
  if (channelMatch) {
    return channelMatch[1];
  }

  // For handle-based URLs, we'll need to extract from page later
  return null;
}

/**
 * Extract channel handle from text
 * @param {string} text - Text containing handle
 * @returns {string|null} - Handle or null
 */
function extractHandle(text) {
  if (!text) return null;

  // Match @username format
  const handleMatch = text.match(/@[\w-]+/);
  return handleMatch ? handleMatch[0] : null;
}

/**
 * Check if a subscribe button is already subscribed
 * @param {Element} button - Subscribe button element
 * @returns {boolean} - True if already subscribed
 */
function isAlreadySubscribed(button) {
  if (!button) return false;

  const ariaLabel = button.getAttribute('aria-label') || '';
  const lowerLabel = ariaLabel.toLowerCase();

  return lowerLabel.includes('unsubscribe') ||
         lowerLabel.includes('subscribed') ||
         lowerLabel.includes('notification');
}

/**
 * Wait for an element to appear in DOM
 * @param {Array<string>} selectorArray - Array of selectors to try
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<Element>} - Promise resolving to element
 */
function waitForElement(selectorArray, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkElement = () => {
      const elem = findElement(selectorArray);

      if (elem) {
        resolve(elem);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error('Element not found within timeout'));
        return;
      }

      setTimeout(checkElement, 100);
    };

    checkElement();
  });
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export functions for use in content scripts
if (typeof window !== 'undefined') {
  window.YouTubeHelpers = {
    SELECTORS,
    findElement,
    findAllElements,
    isUserLoggedIn,
    getYouTubePageType,
    extractChannelIdFromUrl,
    extractHandle,
    isAlreadySubscribed,
    waitForElement,
    sleep
  };
}

} // End of initialization check
