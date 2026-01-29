/**
 * Popup UI Controller
 * Manages user interactions and communication with service worker
 */

// DOM Elements
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const startImportBtn = document.getElementById('startImportBtn');
const settingsToggle = document.getElementById('settingsToggle');
const settingsPanel = document.getElementById('settingsPanel');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const progressSection = document.getElementById('progressSection');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const currentChannel = document.getElementById('currentChannel');
const successCount = document.getElementById('successCount');
const failedCount = document.getElementById('failedCount');
const skippedCount = document.getElementById('skippedCount');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const cancelBtn = document.getElementById('cancelBtn');
const statusMessage = document.getElementById('statusMessage');
const compareBtn = document.getElementById('compareBtn');
const filterBtn = document.getElementById('filterBtn');
const mergeBtn = document.getElementById('mergeBtn');

// Slider elements
const delaySlider = document.getElementById('delaySlider');
const delayValue = document.getElementById('delayValue');
const batchSizeSlider = document.getElementById('batchSizeSlider');
const batchSizeValue = document.getElementById('batchSizeValue');
const batchPauseSlider = document.getElementById('batchPauseSlider');
const batchPauseValue = document.getElementById('batchPauseValue');

// State
let uploadedData = null;
let currentSettings = null;
let importInProgress = false;

/**
 * Initialize popup
 */
async function init() {
  console.log('Popup initialized');

  // Test service worker connection
  try {
    await sendMessageToServiceWorker({ type: 'PING' });
    console.log('Service worker connection OK');
  } catch (error) {
    console.error('Service worker not responding:', error);
    showStatus('Extension error: Service worker not loaded. Try reloading the extension.', 'error');
    return;
  }

  // Load settings
  await loadSettings();

  // Check for in-progress import
  await checkImportState();

  // Setup event listeners
  setupEventListeners();
}

/**
 * Load settings from storage
 */
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('settings');
    currentSettings = result.settings || {
      delayBetweenSubs: 3000,
      batchSize: 10,
      batchPauseDuration: 10000
    };

    // Update UI
    delaySlider.value = currentSettings.delayBetweenSubs / 1000;
    delayValue.textContent = `${currentSettings.delayBetweenSubs / 1000}s`;

    batchSizeSlider.value = currentSettings.batchSize;
    batchSizeValue.textContent = currentSettings.batchSize;

    batchPauseSlider.value = currentSettings.batchPauseDuration / 1000;
    batchPauseValue.textContent = `${currentSettings.batchPauseDuration / 1000}s`;

  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Save settings to storage
 */
async function saveSettings() {
  try {
    const settings = {
      delayBetweenSubs: parseFloat(delaySlider.value) * 1000,
      batchSize: parseInt(batchSizeSlider.value),
      batchPauseDuration: parseFloat(batchPauseSlider.value) * 1000
    };

    await chrome.storage.local.set({ settings });
    currentSettings = settings;

    showStatus('Settings saved successfully', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Failed to save settings', 'error');
  }
}

/**
 * Check if there's an import in progress
 */
async function checkImportState() {
  try {
    const response = await sendMessageToServiceWorker({ type: 'GET_IMPORT_STATE' });

    if (response.state === 'running' && response.progress) {
      importInProgress = true;
      showProgressSection();
      updateProgress(response.progress);
    } else if (response.state === 'paused' && response.progress) {
      importInProgress = true;
      showProgressSection();
      updateProgress(response.progress);
      pauseBtn.classList.add('hidden');
      resumeBtn.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error checking import state:', error);
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Export button
  exportBtn.addEventListener('click', handleExport);

  // Import button
  importBtn.addEventListener('click', () => fileInput.click());

  // File input
  fileInput.addEventListener('change', handleFileSelect);

  // Start import button
  startImportBtn.addEventListener('click', handleStartImport);

  // Settings toggle
  settingsToggle.addEventListener('click', toggleSettings);

  // Save settings button
  saveSettingsBtn.addEventListener('click', saveSettings);

  // Slider updates
  delaySlider.addEventListener('input', (e) => {
    delayValue.textContent = `${e.target.value}s`;
  });

  batchSizeSlider.addEventListener('input', (e) => {
    batchSizeValue.textContent = e.target.value;
  });

  batchPauseSlider.addEventListener('input', (e) => {
    batchPauseValue.textContent = `${e.target.value}s`;
  });

  // Progress controls
  pauseBtn.addEventListener('click', handlePause);
  resumeBtn.addEventListener('click', handleResume);
  cancelBtn.addEventListener('click', handleCancel);

  // Advanced features (placeholders for now)
  compareBtn.addEventListener('click', () => {
    showStatus('Compare feature coming soon!', 'info');
  });

  filterBtn.addEventListener('click', () => {
    showStatus('Filter feature coming soon!', 'info');
  });

  mergeBtn.addEventListener('click', () => {
    showStatus('Merge feature coming soon!', 'info');
  });

  // Listen for progress updates from service worker
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'IMPORT_PROGRESS') {
      updateProgress(message.progress);
    }
  });
}

/**
 * Send message to service worker with error handling
 */
async function sendMessageToServiceWorker(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Handle export button click
 */
async function handleExport() {
  try {
    exportBtn.disabled = true;
    exportBtn.innerHTML = '<span class="spinner"></span> Exporting...';

    const response = await sendMessageToServiceWorker({ type: 'EXPORT_START' });

    if (response.success) {
      // Download the file
      const filename = `youtube-subscriptions-${new Date().toISOString().split('T')[0]}.json`;
      const jsonString = JSON.stringify(response.data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(url);

      showStatus(`Successfully exported ${response.count} subscriptions`, 'success');
    } else {
      showStatus(`Export failed: ${response.error}`, 'error');
    }

  } catch (error) {
    console.error('Export error:', error);
    showStatus(`Export failed: ${error.message}`, 'error');
  } finally {
    exportBtn.disabled = false;
    exportBtn.innerHTML = '<span class="btn-text">Export to JSON</span>';
  }
}

/**
 * Handle file select
 */
async function handleFileSelect(event) {
  const file = event.target.files[0];

  if (!file) return;

  try {
    // Read file
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Validate data
        if (!data.subscriptions || !Array.isArray(data.subscriptions)) {
          showStatus('Invalid file format: missing subscriptions array', 'error');
          return;
        }

        if (data.subscriptions.length === 0) {
          showStatus('No subscriptions found in file', 'error');
          return;
        }

        // Store data
        uploadedData = data;

        // Show file info
        fileInfo.textContent = `Found ${data.subscriptions.length} channels to import`;
        fileInfo.classList.remove('hidden');
        startImportBtn.classList.remove('hidden');

        showStatus('File loaded successfully', 'success');

      } catch (error) {
        showStatus('Failed to parse JSON file', 'error');
      }
    };

    reader.readAsText(file);

  } catch (error) {
    console.error('File read error:', error);
    showStatus(`Failed to read file: ${error.message}`, 'error');
  }
}

/**
 * Handle start import
 */
async function handleStartImport() {
  if (!uploadedData) {
    showStatus('Please select a file first', 'error');
    return;
  }

  try {
    startImportBtn.disabled = true;
    startImportBtn.innerHTML = '<span class="spinner"></span> Starting...';

    // Show progress section
    showProgressSection();
    importInProgress = true;

    // Start import
    const response = await sendMessageToServiceWorker({
      type: 'IMPORT_START',
      subscriptions: uploadedData.subscriptions,
      settings: currentSettings
    });

    if (response.success) {
      showStatus('Import completed successfully!', 'success');
      displayFinalResults(response.summary);
    } else if (response.paused) {
      pauseBtn.classList.add('hidden');
      resumeBtn.classList.remove('hidden');
    } else if (response.cancelled) {
      showStatus('Import cancelled', 'warning');
      displayFinalResults({
        total: uploadedData.subscriptions.length,
        succeeded: response.results.success.length,
        failed: response.results.failed.length,
        skipped: response.results.skipped.length
      });
    } else {
      showStatus(`Import failed: ${response.error}`, 'error');
    }

  } catch (error) {
    console.error('Import error:', error);
    showStatus(`Import failed: ${error.message}`, 'error');
  } finally {
    importInProgress = false;
    startImportBtn.disabled = false;
    startImportBtn.innerHTML = '<span class="btn-text">Start Import</span>';
  }
}

/**
 * Handle pause
 */
async function handlePause() {
  try {
    await sendMessageToServiceWorker({ type: 'IMPORT_PAUSE' });
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.remove('hidden');
    showStatus('Import paused', 'info');
  } catch (error) {
    console.error('Pause error:', error);
  }
}

/**
 * Handle resume
 */
async function handleResume() {
  try {
    resumeBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');

    const response = await sendMessageToServiceWorker({ type: 'IMPORT_RESUME' });

    if (response.success) {
      showStatus('Import completed!', 'success');
      displayFinalResults(response.summary);
    }
  } catch (error) {
    console.error('Resume error:', error);
    showStatus(`Resume failed: ${error.message}`, 'error');
  }
}

/**
 * Handle cancel
 */
async function handleCancel() {
  if (!confirm('Are you sure you want to cancel the import?')) {
    return;
  }

  try {
    await sendMessageToServiceWorker({ type: 'IMPORT_CANCEL' });
    showStatus('Import cancelled', 'warning');
    hideProgressSection();
  } catch (error) {
    console.error('Cancel error:', error);
  }
}

/**
 * Show progress section
 */
function showProgressSection() {
  progressSection.classList.remove('hidden');
  // Reset progress
  progressBar.style.width = '0%';
  progressText.textContent = '0 / 0';
  currentChannel.textContent = '';
  successCount.textContent = '0';
  failedCount.textContent = '0';
  skippedCount.textContent = '0';
}

/**
 * Hide progress section
 */
function hideProgressSection() {
  progressSection.classList.add('hidden');
}

/**
 * Update progress display
 */
function updateProgress(progress) {
  const percent = (progress.currentIndex / progress.total) * 100;

  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${progress.currentIndex} / ${progress.total}`;
  currentChannel.textContent = `Currently: ${progress.currentChannel || 'Processing...'}`;

  if (progress.results) {
    successCount.textContent = progress.results.success.length;
    failedCount.textContent = progress.results.failed.length;
    skippedCount.textContent = progress.results.skipped.length;
  }
}

/**
 * Display final results
 */
function displayFinalResults(summary) {
  progressBar.style.width = '100%';
  currentChannel.textContent = 'Complete!';

  const message = `
    Import complete!
    Succeeded: ${summary.succeeded}
    Failed: ${summary.failed}
    Skipped: ${summary.skipped}
    Total: ${summary.total}
  `;

  showStatus(message, 'success');
}

/**
 * Toggle settings panel
 */
function toggleSettings() {
  settingsPanel.classList.toggle('hidden');
  const icon = settingsToggle.querySelector('.toggle-icon');
  icon.classList.toggle('rotated');
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.classList.remove('hidden');

  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusMessage.classList.add('hidden');
  }, 5000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
