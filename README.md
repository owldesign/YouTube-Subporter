# YouTube Subporter

> Export and import YouTube subscriptions without API - simple, clean, and privacy-focused.

YouTube Subporter is a Chrome extension that allows you to easily export your YouTube subscriptions from one account and import them to another account, without needing to use Google APIs or any backend services. Everything runs locally in your browser.

## Features

- ✅ **Export Subscriptions** - Extract all your YouTube subscriptions as a JSON file
- ✅ **Import Subscriptions** - Upload a JSON file and automatically subscribe to channels
- ✅ **Smart Duplicate Detection** - Automatically skips channels you're already subscribed to
- ✅ **User-Configurable Rate Limiting** - Adjust delays to avoid YouTube rate limits
- ✅ **Progress Tracking** - Real-time progress updates with pause/resume/cancel controls
- ✅ **Privacy-Focused** - No data collection, no external servers, everything stays local
- ✅ **Compare** - Compare subscription lists between accounts
- ✅ **Filter** - Filter channels before importing 
- ✅ **Merge** - Merge multiple subscription lists

## Installation

### From Source (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `YouTube Subporter` directory

### From Chrome Web Store

*Coming soon - extension will be published to Chrome Web Store*

## Usage

### Exporting Subscriptions

1. Navigate to your YouTube subscriptions page: `https://www.youtube.com/feed/channels`
2. Click the YouTube Subporter extension icon in your browser toolbar
3. Click the "Export to JSON" button
4. Wait while the extension scrolls and extracts all your subscriptions
5. A JSON file will be downloaded automatically (e.g., `youtube-subscriptions-2026-01-28.json`)

**Note:** Make sure you're logged into the YouTube account you want to export from.

### Importing Subscriptions

1. Log into the YouTube account where you want to import subscriptions
2. Open any YouTube page
3. Click the YouTube Subporter extension icon
4. Click "Choose JSON File" and select your exported JSON file
5. Review the file information (number of channels)
6. (Optional) Adjust rate limiting settings by expanding the Settings section
7. Click "Start Import"
8. Watch the progress as channels are automatically subscribed
9. You can pause, resume, or cancel at any time

**Important:** The import process will navigate through each channel page to subscribe. Don't close the tab or navigate away during import.

### Settings

Click the "⚙️ Settings" button to configure:

- **Delay between subscriptions** (1-10 seconds, default: 3s)
  - Time to wait between each subscription
  - Increase if you encounter rate limiting issues

- **Batch size** (5-50 channels, default: 10)
  - Number of channels to subscribe to before taking a longer pause
  - Helps avoid rate limiting

- **Pause between batches** (5-30 seconds, default: 10s)
  - Length of pause after completing a batch
  - Gives YouTube time to process subscriptions

Settings are saved automatically and persist across sessions.

## How It Works

### Export Process

1. Extension injects content script into YouTube subscriptions page
2. Programmatically scrolls to load all subscriptions (YouTube uses lazy loading)
3. Extracts channel information from DOM:
   - Channel ID
   - Channel name
   - Channel handle (@username)
   - Channel URL
   - Thumbnail URL
   - Subscriber count (optional)
4. Formats data as JSON and triggers download

### Import Process

1. User uploads JSON file
2. Extension validates file structure
3. For each channel:
   - Navigates to channel page
   - Injects subscriber content script
   - Detects if already subscribed (skips if yes)
   - Clicks subscribe button programmatically
   - Waits for configured delay
   - Updates progress in real-time
4. Shows final results (success/failed/skipped counts)

### Privacy & Security

- ✅ No data ever leaves your browser
- ✅ No external API calls
- ✅ No tracking or analytics
- ✅ No backend servers
- ✅ Open source - audit the code yourself
- ✅ Only requests necessary permissions

## File Format

Export files are JSON formatted with the following structure:

```json
{
  "version": "1.0",
  "exportedAt": "2026-01-28T15:30:00.000Z",
  "source": "YouTube Subporter",
  "totalSubscriptions": 150,
  "subscriptions": [
    {
      "channelId": "UCXuqSBlHAE6Xw-yeJA0Tunw",
      "channelName": "Linus Tech Tips",
      "channelHandle": "@LinusTechTips",
      "channelUrl": "https://www.youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw",
      "thumbnailUrl": "https://yt3.ggpht.com/...",
      "subscriberCount": "15.2M",
      "extractedAt": "2026-01-28T15:30:00.000Z"
    }
  ]
}
```

## Permissions Explained

The extension requests the following permissions:

- **activeTab** - Access the current YouTube tab
- **scripting** - Inject content scripts to extract/subscribe
- **storage** - Save user settings and progress
- **downloads** - Download exported subscription files
- **host_permissions (youtube.com)** - Only works on YouTube

## Troubleshooting

### Export Issues

**Problem:** Export stuck on "Loading subscriptions..."

- **Solution:** Make sure you're on the subscriptions page (`youtube.com/feed/channels`)
- **Solution:** Check that you're logged in to YouTube
- **Solution:** Try refreshing the page and starting again

**Problem:** Export only captured a few subscriptions

- **Solution:** The page may not have fully loaded. Try scrolling manually first, then export again
- **Solution:** Check your internet connection

### Import Issues

**Problem:** Import failing with "Subscribe button not found"

- **Solution:** YouTube's DOM may have changed. Check for extension updates
- **Solution:** Try increasing the delay between subscriptions in settings
- **Solution:** Verify you're logged in to YouTube

**Problem:** Getting rate limited by YouTube

- **Solution:** Increase delay between subscriptions (5-10 seconds)
- **Solution:** Decrease batch size (5 channels)
- **Solution:** Increase pause between batches (20-30 seconds)
- **Solution:** Pause the import, wait 10-15 minutes, then resume

**Problem:** Import shows "already subscribed" for channels I'm not subscribed to

- **Solution:** This is rare but can happen if YouTube's button state is unclear
- **Solution:** Manually check if you're actually subscribed (the channel page will show "Subscribed")

### General Issues

**Problem:** Extension icon doesn't appear

- **Solution:** Make sure Developer Mode is enabled in `chrome://extensions/`
- **Solution:** Try reloading the extension

**Problem:** Progress not updating during import

- **Solution:** Keep the extension popup open during import
- **Solution:** Don't navigate away from the YouTube tab

**Problem:** Import interrupted (tab closed, browser crashed)

- **Solution:** Extension saves progress automatically
- **Solution:** Reopen popup and check for "Resume" option
- **Solution:** If no resume option, you'll need to start import again (already-subscribed channels will be skipped)

## Known Limitations

- Import process requires keeping YouTube tab active (can't browse other sites during import)
- Export only works from the subscriptions page (`/feed/channels`)
- YouTube may rate limit if you import too many channels too quickly
- YouTube's DOM structure may change, potentially breaking selectors (we use fallbacks to mitigate this)
- Cannot import to YouTube brand accounts (only personal accounts)
- Does not preserve subscription folders/categories (YouTube API limitation)

## Roadmap

### Version 1.1
- [ ] Compare feature - diff two subscription lists
- [ ] Filter feature - filter channels before import
- [ ] Merge feature - combine multiple subscription lists
- [ ] Better icons and branding

### Version 1.2
- [ ] Export to CSV format
- [ ] Import from CSV format
- [ ] Scheduling automatic exports
- [ ] Subscription history tracking

### Future
- [ ] Browser extension for Firefox
- [ ] Support for exporting/importing playlists
- [ ] Subscription statistics and analytics
- [ ] Dark mode support

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Development Setup

1. Clone the repository
2. Make your changes
3. Test thoroughly in Chrome
4. Submit a pull request

### Testing Checklist

- [ ] Export with 10, 50, 100+ subscriptions
- [ ] Import with various delay settings
- [ ] Test pause/resume/cancel
- [ ] Test with already-subscribed channels
- [ ] Test error scenarios (network issues, not logged in)
- [ ] Verify no console errors
- [ ] Check memory usage during long imports

## License

MIT License - see LICENSE file for details

## Author

Created by **[owldesign](https://github.com/owldesign)**

## Support

- Report bugs via [GitHub Issues](https://github.com/owldesign/YouTube-Subporter/issues)
- For questions, use [GitHub Discussions](https://github.com/owldesign/YouTube-Subporter/discussions)
- Star the project on [GitHub](https://github.com/owldesign/YouTube-Subporter)

## Disclaimer

This extension is not affiliated with, endorsed by, or connected to YouTube or Google in any way. Use at your own risk. The extension respects YouTube's terms of service by not using undocumented APIs and by rate-limiting automatic actions to avoid abuse.

---

**Made with ❤️ for people who manage multiple YouTube accounts**
