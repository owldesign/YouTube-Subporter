# Advanced Features Documentation

## Overview

YouTube Subporter now includes three powerful advanced features: Compare, Filter, and Merge. These tools help you manage subscriptions across multiple accounts more effectively.

---

## 🔍 Compare Feature

Compare two subscription export files to see the differences between them.

### Use Cases
- Compare subscriptions between two YouTube accounts
- See what channels you've added since your last export
- Identify channels unique to each account

### How to Use

1. Click the **"Compare"** button in the Advanced Tools section
2. Upload two JSON export files:
   - **File 1**: Click the file name area and select your first export
   - **File 2**: Click the file name area and select your second export
3. Click **"Compare"** button
4. View the results:
   - **Only in File 1**: Channels unique to the first file
   - **Only in File 2**: Channels unique to the second file
   - **In Both**: Channels present in both files
5. Click **"Export Differences"** to save the comparison results as JSON

### Example Workflow
```
Account A: 150 subscriptions
Account B: 120 subscriptions

Comparison Results:
- Only in A: 50 channels
- Only in B: 20 channels
- In Both: 100 channels
```

---

## 🎯 Filter Feature

Filter subscriptions by keyword or subscriber count before importing.

### Use Cases
- Import only tech channels from a large subscription list
- Import only channels with more than 100K subscribers
- Filter out channels with specific keywords

### How to Use

1. First, upload a subscription file in the Import section
2. Click the **"Filter"** button in Advanced Tools
3. Set your filter criteria:
   - **Keyword**: Search by channel name or handle (e.g., "tech", "gaming")
   - **Subscriber Count**: Set minimum and/or maximum subscriber count
4. Click **"Apply Filter"**
5. Review filtered results showing count of matching channels
6. Options:
   - **Clear Filter**: Remove all filters
   - **Import Filtered**: Import only the filtered channels

### Filter Examples

**Example 1: Tech Channels**
```
Keyword: "tech"
Min Subs: 10000
Max Subs: (leave empty)

Result: 15 channels matching "tech" with 10K+ subscribers
```

**Example 2: Large Channels**
```
Keyword: (leave empty)
Min Subs: 1000000
Max Subs: (leave empty)

Result: 8 channels with 1M+ subscribers
```

**Example 3: Specific Creator**
```
Keyword: "@LinusTechTips"
Min Subs: (leave empty)
Max Subs: (leave empty)

Result: 1 channel matching the handle
```

---

## 🔀 Merge Feature

Combine multiple subscription export files into one, removing duplicates.

### Use Cases
- Merge subscriptions from multiple accounts
- Consolidate multiple partial exports
- Create a master subscription list

### How to Use

1. Click the **"Merge"** button in Advanced Tools
2. Click the file count area to select multiple JSON files
   - You can select multiple files at once (Ctrl/Cmd + Click)
3. Click **"Merge Files"**
4. View merge results:
   - **Total unique channels**: Number of channels after removing duplicates
   - **Duplicates removed**: Number of duplicate channels found
5. Options:
   - **Export Merged**: Save the merged list as a new JSON file
   - **Import Merged**: Use the merged list for importing

### Example Workflow
```
File 1: 100 subscriptions
File 2: 120 subscriptions
File 3: 80 subscriptions

Total before merge: 300 channels
Duplicates found: 50 channels
Result: 250 unique channels
```

---

## 📊 Data Formats

### Compare Export Format
```json
{
  "version": "1.0",
  "exportedAt": "2026-01-28T...",
  "source": "YouTube Subporter - Comparison",
  "comparison": {
    "onlyInFile1": [...],
    "onlyInFile2": [...],
    "inBoth": [...]
  }
}
```

### Merged Export Format
```json
{
  "version": "1.0",
  "exportedAt": "2026-01-28T...",
  "source": "YouTube Subporter - Merged",
  "totalSubscriptions": 250,
  "subscriptions": [...]
}
```

---

## 💡 Tips & Best Practices

### Compare
- Export from both accounts on the same day for accurate comparison
- Use "Export Differences" to keep track of what needs to be synced
- The comparison is based on Channel IDs, not names

### Filter
- Combine keyword and subscriber count filters for precise results
- Use partial keywords (e.g., "tech" matches "TechLinus", "LinusTech", etc.)
- Filter is case-insensitive

### Merge
- Duplicate detection is based on Channel ID
- Merged files preserve all metadata from the first occurrence
- You can merge 2-10 files at once

---

## 🔧 Technical Details

### Subscriber Count Parsing
The filter feature understands these formats:
- `1.5M` = 1,500,000
- `500K` = 500,000
- `1,234` = 1,234
- `15.2M subscribers` = 15,200,000

### Duplicate Detection
Channels are considered duplicates if they have the same `channelId`. Channel names or handles don't affect duplicate detection.

### Performance
- Compare: Handles files with 1000+ channels each
- Filter: Real-time filtering, instant results
- Merge: Can merge 10 files with 500+ channels each

---

## 🚀 Keyboard Shortcuts

When modals are open:
- **Esc**: Close the current modal
- **Enter**: Submit/Apply (when focused on input fields)

---

## ⚠️ Limitations

1. **File Size**: Very large files (5000+ channels) may take a few seconds to process
2. **Browser Memory**: Merging 10+ large files may require significant memory
3. **Compare Accuracy**: Comparison is based on channel IDs; channels without IDs are skipped

---

## 🐛 Troubleshooting

### "No channels to import"
- Make sure you've uploaded a file first (in Import section for Filter)
- Make sure you've clicked "Compare" or "Merge" before trying to export

### Filter shows 0 results
- Check your keyword spelling
- Try removing the subscriber count filters
- Make sure the uploaded file contains valid subscription data

### Merge not working
- Ensure all selected files are valid JSON exports
- Files must have a "subscriptions" array
- Try selecting files one at a time to identify any corrupted files

---

## 📝 Examples

### Full Workflow Example: Sync Two Accounts

1. **Export from both accounts**
   - Account A: `account-a-subs.json`
   - Account B: `account-b-subs.json`

2. **Compare the exports**
   - Upload both files to Compare
   - Note: A has 30 unique channels, B has 15 unique

3. **Import unique channels**
   - Import `account-a-subs.json` into Account B (use Filter to select only those 30)
   - Import `account-b-subs.json` into Account A (use Filter for those 15)

4. **Verify sync**
   - Export from both again
   - Compare - should show 0 unique channels

---

## 🎓 Advanced Use Cases

### Creating a Curated List
1. Export from your main account
2. Use Filter to select high-quality channels (e.g., 100K+ subscribers)
3. Use Filter again with keywords for specific topics
4. Export the filtered list
5. Import to a new "curated" account

### Managing Family Accounts
1. Export from each family member's account
2. Merge all exports together
3. Use Filter to create age-appropriate lists
4. Import filtered lists to each account

### Backup and Restore
1. Export regularly
2. Merge all exports periodically
3. Keep the merged file as a master backup
4. Use for easy restore if an account is lost

---

## 🔐 Privacy & Security

All advanced features:
- ✅ Run entirely in your browser
- ✅ No data sent to external servers
- ✅ No tracking or analytics
- ✅ Files are processed locally
- ✅ Your data never leaves your computer

---

## 📞 Support

For issues with advanced features:
- Check this documentation first
- Review the main README.md
- Report bugs on [GitHub Issues](https://github.com/owldesign/YouTube-Subporter/issues)
- Include: feature name, steps taken, expected vs actual result

---

**Happy subscription managing! 🎉**
