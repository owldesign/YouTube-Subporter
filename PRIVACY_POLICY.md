# Privacy Policy for YouTube Subporter

**Last Updated: January 29, 2026**

## Overview

YouTube Subporter is a privacy-focused Chrome extension that helps users export and import YouTube subscriptions. This privacy policy explains our data practices.

## Data Collection

**YouTube Subporter does NOT collect, store, or transmit any personal user data.**

### What We Access

The extension accesses:
- YouTube subscription data from your browser's DOM (channel names, IDs, URLs)
- This data is only accessed when you explicitly click "Export" or "Import"
- The data is processed locally in your browser only

### What We Store Locally

The extension stores the following **locally in your browser only** using Chrome's storage API:
- User preferences (rate limiting settings, delay configurations)
- Temporary import progress (to enable pause/resume functionality)

**This data:**
- Never leaves your device
- Is not transmitted to any external servers
- Is not shared with third parties
- Can be cleared by removing the extension

### What We Do NOT Collect

We do NOT collect, store, or transmit:
- ❌ Personal information (name, email, address)
- ❌ Authentication credentials (passwords, tokens)
- ❌ Browsing history
- ❌ Analytics or usage statistics
- ❌ Any data to external servers
- ❌ Cookies or tracking identifiers

## How the Extension Works

### Export Process
1. You navigate to YouTube's subscriptions page
2. You click "Export to JSON" in the extension
3. The extension reads subscription data from the page's DOM
4. A JSON file is created locally and downloaded to your computer
5. No data is stored or transmitted

### Import Process
1. You upload a JSON file from your computer
2. The extension reads the file locally
3. The extension navigates to channel pages and clicks subscribe buttons
4. Progress is stored locally to enable pause/resume
5. No data is transmitted externally

## Third-Party Services

YouTube Subporter does NOT use any third-party services, analytics, or tracking tools. The extension operates entirely client-side in your browser.

## Data Security

Since no data is collected or transmitted:
- Your subscription data remains private
- No server breaches are possible
- Your data never leaves your device
- You have complete control over exported JSON files

## Permissions Explained

The extension requests the following Chrome permissions:

- **activeTab**: To access the current YouTube tab when you click the extension icon
- **scripting**: To inject scripts that read subscription data and automate clicks
- **storage**: To save your settings locally (rate limits, delays)
- **downloads**: To generate and download the JSON export file
- **host_permissions (youtube.com)**: To access YouTube pages for reading and automating subscriptions

These permissions are used solely for the extension's core functionality and not for data collection.

## Your Rights

You have complete control over your data:
- **Access**: All data is stored locally on your device
- **Deletion**: Remove the extension to delete all local data
- **Portability**: Export files are in standard JSON format
- **Control**: You decide when to export or import

## Open Source

YouTube Subporter is open source. You can review the complete source code at:
https://github.com/owldesign/YouTube-Subporter

## Children's Privacy

YouTube Subporter does not knowingly collect data from users of any age. The extension operates entirely locally without data collection.

## Changes to This Policy

We may update this privacy policy to reflect changes in the extension. Updates will be posted on our GitHub repository with the "Last Updated" date revised.

## Contact

For privacy questions or concerns:
- GitHub Issues: https://github.com/owldesign/YouTube-Subporter/issues
- Repository: https://github.com/owldesign/YouTube-Subporter

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- Chrome Extension Manifest V3 requirements
- General Data Protection Regulation (GDPR) principles
- California Consumer Privacy Act (CCPA) principles

## Summary

**YouTube Subporter is designed with privacy as a core principle:**
- ✅ No data collection
- ✅ No external servers
- ✅ No tracking or analytics
- ✅ All processing is local
- ✅ Open source and transparent
- ✅ You control your data

---

**Questions?** Visit our GitHub repository or open an issue for clarification.
