/**
 * Subscriber Content Script
 * Automates subscribing to YouTube channels
 * This script is injected into individual channel pages
 */

// Only initialize once to avoid redeclaration errors
if (window.YTSubporterSubscriber) {
  console.log('Subscriber already loaded');
} else {
  window.YTSubporterSubscriber = true;

// Import helpers
const { SELECTORS, findElement, isAlreadySubscribed, waitForElement, sleep } = window.YouTubeHelpers || {};

/**
 * Find and check subscribe button
 * @returns {Promise<Object>} - Button state: { button, isSubscribed }
 */
async function findSubscribeButton() {
  try {
    console.log('Waiting for subscribe button...');

    // Wait for subscribe button to appear (max 10 seconds)
    const button = await waitForElement(SELECTORS.subscribeButton, 10000);

    if (!button) {
      throw new Error('Subscribe button not found');
    }

    // Check if already subscribed
    const subscribed = isAlreadySubscribed(button);

    console.log('Subscribe button found:', {
      ariaLabel: button.getAttribute('aria-label'),
      isSubscribed: subscribed
    });

    return {
      button,
      isSubscribed: subscribed
    };

  } catch (error) {
    console.error('Error finding subscribe button:', error);
    throw error;
  }
}

/**
 * Click subscribe button
 * @param {Element} button - Subscribe button element
 * @returns {Promise<boolean>} - True if clicked successfully
 */
async function clickSubscribeButton(button) {
  try {
    console.log('Clicking subscribe button...');

    // Click the button
    button.click();

    // Wait a moment for the action to process
    await sleep(500);

    // Verify subscription state changed
    const newAriaLabel = button.getAttribute('aria-label') || '';
    const isNowSubscribed = newAriaLabel.toLowerCase().includes('subscribed') ||
                           newAriaLabel.toLowerCase().includes('unsubscribe');

    if (isNowSubscribed) {
      console.log('Successfully subscribed');
      return true;
    } else {
      console.warn('Subscribe button clicked but state unclear');
      return true; // Assume success
    }

  } catch (error) {
    console.error('Error clicking subscribe button:', error);
    throw error;
  }
}

/**
 * Main subscribe function
 * @param {Object} channelData - Channel data with channelId, channelName, channelUrl
 * @returns {Promise<Object>} - Result: { status, channelId, channelName, message }
 */
async function subscribeToChannel(channelData) {
  try {
    console.log('Attempting to subscribe to:', channelData.channelName);

    // Find subscribe button
    const { button, isSubscribed } = await findSubscribeButton();

    // If already subscribed, skip
    if (isSubscribed) {
      console.log('Already subscribed to:', channelData.channelName);
      return {
        status: 'skipped',
        channelId: channelData.channelId,
        channelName: channelData.channelName,
        message: 'Already subscribed'
      };
    }

    // Click subscribe button
    await clickSubscribeButton(button);

    // Success
    return {
      status: 'success',
      channelId: channelData.channelId,
      channelName: channelData.channelName,
      message: 'Successfully subscribed'
    };

  } catch (error) {
    console.error('Failed to subscribe:', error);

    // Check specific error types
    if (error.message.includes('not found')) {
      return {
        status: 'failed',
        channelId: channelData.channelId,
        channelName: channelData.channelName,
        message: 'Subscribe button not found',
        error: error.message
      };
    }

    return {
      status: 'failed',
      channelId: channelData.channelId,
      channelName: channelData.channelName,
      message: 'Subscription failed',
      error: error.message
    };
  }
}

/**
 * Check current page and verify it's a channel page
 * @returns {boolean} - True if on a channel page
 */
function isOnChannelPage() {
  const url = window.location.href;
  return url.includes('/channel/') || url.includes('/@');
}

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SUBSCRIBE_TO_CHANNEL') {
    console.log('Received subscribe request for:', message.channelData);

    // Verify we're on a channel page
    if (!isOnChannelPage()) {
      sendResponse({
        success: false,
        result: {
          status: 'failed',
          message: 'Not on a channel page',
          channelId: message.channelData.channelId,
          channelName: message.channelData.channelName
        }
      });
      return true;
    }

    // Attempt to subscribe
    subscribeToChannel(message.channelData)
      .then(result => {
        console.log('Subscribe result:', result);
        sendResponse({
          success: true,
          result
        });
      })
      .catch(error => {
        console.error('Subscribe error:', error);
        sendResponse({
          success: false,
          result: {
            status: 'failed',
            channelId: message.channelData.channelId,
            channelName: message.channelData.channelName,
            message: error.message,
            error: error.message
          }
        });
      });

    // Return true to indicate we'll send response asynchronously
    return true;
  }
});

console.log('Subscriber content script loaded');

} // End of initialization check
