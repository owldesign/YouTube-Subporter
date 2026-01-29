/**
 * Chrome Storage Utility Functions
 * Handles settings, progress, and state management
 */

// Default settings
const DEFAULT_SETTINGS = {
  delayBetweenSubs: 3000,      // 3 seconds
  batchSize: 10,                // 10 channels per batch
  batchPauseDuration: 10000     // 10 seconds pause between batches
};

/**
 * Get user settings from storage
 * @returns {Promise<Object>} - Settings object
 */
async function getSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    return result.settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save user settings to storage
 * @param {Object} settings - Settings object to save
 * @returns {Promise<void>}
 */
async function saveSettings(settings) {
  try {
    await chrome.storage.local.set({ settings });
    console.log('Settings saved:', settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

/**
 * Get import progress from storage
 * @returns {Promise<Object|null>} - Progress object or null
 */
async function getImportProgress() {
  try {
    const result = await chrome.storage.local.get('importProgress');
    return result.importProgress || null;
  } catch (error) {
    console.error('Error getting import progress:', error);
    return null;
  }
}

/**
 * Save import progress to storage
 * @param {Object} progress - Progress object
 * @returns {Promise<void>}
 */
async function saveImportProgress(progress) {
  try {
    await chrome.storage.local.set({ importProgress: progress });
  } catch (error) {
    console.error('Error saving import progress:', error);
    throw error;
  }
}

/**
 * Clear import progress from storage
 * @returns {Promise<void>}
 */
async function clearImportProgress() {
  try {
    await chrome.storage.local.remove('importProgress');
    console.log('Import progress cleared');
  } catch (error) {
    console.error('Error clearing import progress:', error);
  }
}

/**
 * Get last export data from storage (for comparison features)
 * @returns {Promise<Object|null>} - Export data or null
 */
async function getLastExport() {
  try {
    const result = await chrome.storage.local.get('lastExport');
    return result.lastExport || null;
  } catch (error) {
    console.error('Error getting last export:', error);
    return null;
  }
}

/**
 * Save export data to storage
 * @param {Object} exportData - Export data object
 * @returns {Promise<void>}
 */
async function saveLastExport(exportData) {
  try {
    await chrome.storage.local.set({ lastExport: exportData });
  } catch (error) {
    console.error('Error saving last export:', error);
  }
}

/**
 * Get import state (running, paused, cancelled)
 * @returns {Promise<string>} - State: 'idle', 'running', 'paused', 'cancelled', 'completed'
 */
async function getImportState() {
  try {
    const result = await chrome.storage.local.get('importState');
    return result.importState || 'idle';
  } catch (error) {
    console.error('Error getting import state:', error);
    return 'idle';
  }
}

/**
 * Set import state
 * @param {string} state - State: 'idle', 'running', 'paused', 'cancelled', 'completed'
 * @returns {Promise<void>}
 */
async function setImportState(state) {
  try {
    await chrome.storage.local.set({ importState: state });
    console.log('Import state set to:', state);
  } catch (error) {
    console.error('Error setting import state:', error);
    throw error;
  }
}

/**
 * Store temporary import data (uploaded file data)
 * @param {Object} importData - Import data object
 * @returns {Promise<void>}
 */
async function setImportData(importData) {
  try {
    await chrome.storage.local.set({ importData });
  } catch (error) {
    console.error('Error setting import data:', error);
    throw error;
  }
}

/**
 * Get temporary import data
 * @returns {Promise<Object|null>} - Import data or null
 */
async function getImportData() {
  try {
    const result = await chrome.storage.local.get('importData');
    return result.importData || null;
  } catch (error) {
    console.error('Error getting import data:', error);
    return null;
  }
}

/**
 * Clear temporary import data
 * @returns {Promise<void>}
 */
async function clearImportData() {
  try {
    await chrome.storage.local.remove('importData');
  } catch (error) {
    console.error('Error clearing import data:', error);
  }
}

/**
 * Reset all storage (for cleanup)
 * @returns {Promise<void>}
 */
async function resetAllStorage() {
  try {
    await chrome.storage.local.clear();
    console.log('All storage cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_SETTINGS,
    getSettings,
    saveSettings,
    getImportProgress,
    saveImportProgress,
    clearImportProgress,
    getLastExport,
    saveLastExport,
    getImportState,
    setImportState,
    setImportData,
    getImportData,
    clearImportData,
    resetAllStorage
  };
}

// Make available globally for use in different contexts
if (typeof window !== 'undefined') {
  window.StorageUtils = {
    DEFAULT_SETTINGS,
    getSettings,
    saveSettings,
    getImportProgress,
    saveImportProgress,
    clearImportProgress,
    getLastExport,
    saveLastExport,
    getImportState,
    setImportState,
    setImportData,
    getImportData,
    clearImportData,
    resetAllStorage
  };
}
