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

  // Advanced features
  compareBtn.addEventListener('click', openCompareModal);
  filterBtn.addEventListener('click', openFilterModal);
  mergeBtn.addEventListener('click', openMergeModal);

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

/**
 * Advanced Features: Compare, Filter, Merge
 */

// Get modal elements
const compareModal = document.getElementById('compareModal');
const filterModal = document.getElementById('filterModal');
const mergeModal = document.getElementById('mergeModal');

// Compare modal elements
const compareFile1 = document.getElementById('compareFile1');
const compareFile2 = document.getElementById('compareFile2');
const compareFile1Name = document.getElementById('compareFile1Name');
const compareFile2Name = document.getElementById('compareFile2Name');
const startCompareBtn = document.getElementById('startCompareBtn');
const compareResults = document.getElementById('compareResults');
const closeCompareModal = document.getElementById('closeCompareModal');

// Filter modal elements
const filterKeyword = document.getElementById('filterKeyword');
const filterMinSubs = document.getElementById('filterMinSubs');
const filterMaxSubs = document.getElementById('filterMaxSubs');
const applyFilterBtn = document.getElementById('applyFilterBtn');
const filterResults = document.getElementById('filterResults');
const closeFilterModal = document.getElementById('closeFilterModal');

// Merge modal elements
const mergeFiles = document.getElementById('mergeFiles');
const mergeFilesCount = document.getElementById('mergeFilesCount');
const startMergeBtn = document.getElementById('startMergeBtn');
const mergeResults = document.getElementById('mergeResults');
const closeMergeModal = document.getElementById('closeMergeModal');

// State for advanced features
let compareData = { file1: null, file2: null };
let mergeData = [];
let filteredData = null;

// Make file name spans clickable
compareFile1Name.addEventListener('click', () => compareFile1.click());
compareFile2Name.addEventListener('click', () => compareFile2.click());
mergeFilesCount.addEventListener('click', () => mergeFiles.click());

/**
 * Open Compare Modal
 */
function openCompareModal() {
  compareModal.classList.remove('hidden');
  compareData = { file1: null, file2: null };
  compareResults.classList.add('hidden');
}

/**
 * Open Filter Modal
 */
function openFilterModal() {
  if (!uploadedData) {
    showStatus('Please upload a file first in the Import section', 'error');
    return;
  }
  filterModal.classList.remove('hidden');
  filterResults.classList.add('hidden');
}

/**
 * Open Merge Modal
 */
function openMergeModal() {
  mergeModal.classList.remove('hidden');
  mergeData = [];
  mergeResults.classList.add('hidden');
}

// Compare file handlers
compareFile1.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    compareFile1Name.textContent = file.name;
    readJSONFileForCompare(file, 1);
  }
});

compareFile2.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    compareFile2Name.textContent = file.name;
    readJSONFileForCompare(file, 2);
  }
});

function readJSONFileForCompare(file, fileNum) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (fileNum === 1) {
        compareData.file1 = data;
      } else {
        compareData.file2 = data;
      }

      if (compareData.file1 && compareData.file2) {
        startCompareBtn.disabled = false;
      }
    } catch (error) {
      showStatus(`Failed to read file ${fileNum}`, 'error');
    }
  };
  reader.readAsText(file);
}

startCompareBtn.addEventListener('click', () => {
  const result = compareSubscriptionLists(
    compareData.file1.subscriptions,
    compareData.file2.subscriptions
  );

  document.getElementById('compareOnlyFile1').textContent = result.uniqueInList1;
  document.getElementById('compareOnlyFile2').textContent = result.uniqueInList2;
  document.getElementById('compareBoth').textContent = result.common;

  compareResults.classList.remove('hidden');

  // Store for export
  compareData.differences = result;
});

document.getElementById('exportDiffBtn').addEventListener('click', () => {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    source: 'YouTube Subporter - Comparison',
    comparison: {
      onlyInFile1: compareData.differences.onlyInList1,
      onlyInFile2: compareData.differences.onlyInList2,
      inBoth: compareData.differences.inBoth
    }
  };

  const filename = `subscription-comparison-${new Date().toISOString().split('T')[0]}.json`;
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
  showStatus('Comparison exported successfully', 'success');
});

closeCompareModal.addEventListener('click', () => {
  compareModal.classList.add('hidden');
});

// Filter handlers
applyFilterBtn.addEventListener('click', () => {
  const keyword = filterKeyword.value.trim().toLowerCase();
  const minSubs = parseInt(filterMinSubs.value) || 0;
  const maxSubs = parseInt(filterMaxSubs.value) || Infinity;

  filteredData = uploadedData.subscriptions.filter(sub => {
    const matchesKeyword = !keyword ||
      sub.channelName?.toLowerCase().includes(keyword) ||
      sub.channelHandle?.toLowerCase().includes(keyword);

    const subCount = parseSubscriberCount(sub.subscriberCount);
    const matchesSubs = subCount >= minSubs && subCount <= maxSubs;

    return matchesKeyword && matchesSubs;
  });

  document.getElementById('filteredCount').textContent = filteredData.length;
  document.getElementById('totalCount').textContent = uploadedData.subscriptions.length;
  filterResults.classList.remove('hidden');

  showStatus(`Filtered to ${filteredData.length} channels`, 'success');
});

document.getElementById('clearFilterBtn').addEventListener('click', () => {
  filterKeyword.value = '';
  filterMinSubs.value = '';
  filterMaxSubs.value = '';
  filteredData = null;
  filterResults.classList.add('hidden');
});

document.getElementById('importFilteredBtn').addEventListener('click', async () => {
  if (!filteredData || filteredData.length === 0) {
    showStatus('No channels to import', 'error');
    return;
  }

  filterModal.classList.add('hidden');

  // Use filtered data for import
  const originalData = uploadedData.subscriptions;
  uploadedData.subscriptions = filteredData;

  await handleStartImport();

  // Restore original data
  uploadedData.subscriptions = originalData;
});

closeFilterModal.addEventListener('click', () => {
  filterModal.classList.add('hidden');
});

// Merge handlers
mergeFiles.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  mergeFilesCount.textContent = `${files.length} file(s) selected`;

  if (files.length > 0) {
    startMergeBtn.disabled = false;
    mergeData = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          mergeData.push(data.subscriptions);

          if (mergeData.length === files.length) {
            startMergeBtn.disabled = false;
          }
        } catch (error) {
          showStatus(`Failed to read ${file.name}`, 'error');
        }
      };
      reader.readAsText(file);
    });
  }
});

startMergeBtn.addEventListener('click', () => {
  const merged = mergeSubscriptionLists(mergeData);
  const totalBefore = mergeData.reduce((sum, list) => sum + list.length, 0);
  const duplicates = totalBefore - merged.length;

  document.getElementById('mergeTotal').textContent = merged.length;
  document.getElementById('mergeDuplicates').textContent = duplicates;

  mergeResults.classList.remove('hidden');

  // Store merged data
  mergeData.merged = merged;

  showStatus(`Merged ${merged.length} unique channels`, 'success');
});

document.getElementById('exportMergedBtn').addEventListener('click', () => {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    source: 'YouTube Subporter - Merged',
    totalSubscriptions: mergeData.merged.length,
    subscriptions: mergeData.merged
  };

  const filename = `subscriptions-merged-${new Date().toISOString().split('T')[0]}.json`;
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
  showStatus('Merged file exported successfully', 'success');
});

document.getElementById('importMergedBtn').addEventListener('click', async () => {
  if (!mergeData.merged || mergeData.merged.length === 0) {
    showStatus('No channels to import', 'error');
    return;
  }

  mergeModal.classList.add('hidden');

  // Set merged data as uploaded data
  uploadedData = {
    subscriptions: mergeData.merged
  };

  fileInfo.textContent = `Found ${mergeData.merged.length} channels to import (merged)`;
  fileInfo.classList.remove('hidden');
  startImportBtn.classList.remove('hidden');

  showStatus('Merged data ready to import', 'success');
});

closeMergeModal.addEventListener('click', () => {
  mergeModal.classList.add('hidden');
});

// Helper functions for advanced features
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
    uniqueInList1: onlyInList1.length,
    uniqueInList2: onlyInList2.length,
    common: inBoth.length
  };
}

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

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
