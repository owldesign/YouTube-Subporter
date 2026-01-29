# Chrome Web Store Screenshots Guide

## Required Assets

### Screenshots (5 required)
- **Size**: 1280x800 pixels
- **Format**: PNG or JPG
- **Max file size**: 5MB each

### Small Promo Tile (optional but recommended)
- **Size**: 440x280 pixels
- **Format**: PNG or JPG
- **Max file size**: 1MB

### Marquee Promo Tile (optional)
- **Size**: 1400x560 pixels
- **Format**: PNG or JPG
- **Max file size**: 2MB

---

## Taking Screenshots

### Screenshot 1: Main Popup (Export/Import)
**What to show**: Clean popup interface with Export and Import sections

**Steps**:
1. Open the extension popup on YouTube
2. Make sure window is at default size (400x600)
3. Use Chrome DevTools Device Mode:
   - Open DevTools (F12)
   - Toggle Device Toolbar (Ctrl+Shift+M / Cmd+Shift+M)
   - Set dimensions to 400x600
   - Take screenshot
4. Or use macOS Screenshot (Cmd+Shift+4) and crop to exact size

**Screenshot tip**: Show the clean UI with both Export and Import buttons visible

---

### Screenshot 2: Settings Panel
**What to show**: Settings expanded with sliders

**Steps**:
1. Open extension popup
2. Click "⚙️ Settings" to expand
3. Show the three sliders with values
4. Capture the full popup including settings

**Highlight**: User-configurable rate limiting

---

### Screenshot 3: Progress Tracking
**What to show**: Active import with progress bar

**Steps**:
1. Start a test import (create a small test file with 5-10 channels)
2. Capture while import is running
3. Show progress bar, stats (success/failed/skipped), and controls

**Highlight**: Real-time progress with pause/resume controls

---

### Screenshot 4: Compare Feature
**What to show**: Compare modal with results

**Steps**:
1. Click "Compare" button
2. Upload two test files
3. Click Compare to show results
4. Capture the modal with comparison statistics

**Highlight**: Advanced feature for comparing subscription lists

---

### Screenshot 5: Filter/Merge Feature
**What to show**: Either Filter or Merge modal

**Steps**:
1. Click "Filter" or "Merge" button
2. Show the modal interface
3. If possible, show results section

**Highlight**: Additional tools for power users

---

## Resizing to 1280x800

After taking screenshots, resize them:

### Using macOS Preview
1. Open screenshot in Preview
2. Tools → Adjust Size
3. Set width to 1280, height to 800
4. Ensure "Scale proportionally" is UNCHECKED if needed
5. Export as PNG

### Using ImageMagick (Command Line)
```bash
# Resize and add padding to center if needed
magick screenshot.png -resize 1280x800 -background white -gravity center -extent 1280x800 screenshot-1280x800.png
```

### Using Online Tool
- https://www.iloveimg.com/resize-image
- Upload, set to 1280x800, download

---

## Creating Promo Tiles

### Small Promo Tile (440x280)

**Design Elements**:
- Extension icon (centered or left)
- Extension name: "YouTube Subporter"
- Tagline: "Export & Import Subscriptions"
- YouTube red background (#FF0000) or gradient

**Text to include**:
```
YouTube Subporter
Export & Import Your Subscriptions
✓ No API Required
✓ 100% Privacy-Focused
```

### Marquee Promo Tile (1400x560)

**Design Elements**:
- Larger version of small tile
- More space for features
- Can include mini screenshots
- Brand colors: YouTube red (#FF0000) and white

**Text to include**:
```
YouTube Subporter
Easily Export and Import YouTube Subscriptions

✓ Export subscriptions as JSON
✓ Import to any account
✓ Compare, Filter, and Merge
✓ No API required
✓ Privacy-focused
```

---

## Quick Screenshot Workflow

### Setup Test Environment
```bash
# Create screenshots directory
cd "/Users/owldesign/Projects/chrome-extensions/YouTube Subporter"
mkdir -p screenshots
```

### Take Screenshots Sequence
1. **Main UI** → `screenshots/01-main-interface.png`
2. **Settings** → `screenshots/02-settings-panel.png`
3. **Progress** → `screenshots/03-import-progress.png`
4. **Compare** → `screenshots/04-compare-feature.png`
5. **Filter/Merge** → `screenshots/05-advanced-tools.png`

### Batch Resize (if needed)
```bash
cd screenshots
for i in *.png; do
  magick "$i" -resize 1280x800 -background white -gravity center -extent 1280x800 "store-$i"
done
```

---

## Screenshot Best Practices

### DO:
- Use a clean YouTube page as background
- Show the extension in action
- Highlight key features
- Use actual data (or realistic test data)
- Ensure text is readable
- Show positive results (successful imports, etc.)

### DON'T:
- Include personal information
- Show errors or failures
- Use blurry or low-quality images
- Include browser chrome (unless necessary)
- Show outdated UI

---

## Testing Your Screenshots

Before uploading to Chrome Web Store:

1. **Check dimensions**: Exactly 1280x800 (for main screenshots)
2. **Check file size**: Under 5MB per screenshot
3. **Check quality**: No pixelation or artifacts
4. **Check content**: No sensitive information visible
5. **Check sequence**: Screenshots tell a story of the extension

---

## Example Screenshot Captions

When you upload to Chrome Web Store, add these captions:

1. "Clean, intuitive interface for exporting and importing subscriptions"
2. "Configurable settings to avoid rate limiting"
3. "Real-time progress tracking with pause and resume controls"
4. "Compare subscription lists between accounts"
5. "Advanced filtering and merging tools"

---

## Chrome Web Store Upload Checklist

- [ ] 5 screenshots (1280x800 each)
- [ ] All screenshots are PNG or JPG
- [ ] Each screenshot is under 5MB
- [ ] Small promo tile (440x280) - optional
- [ ] Marquee promo tile (1400x560) - optional
- [ ] Screenshots show different features
- [ ] Captions written for each screenshot
- [ ] No personal/sensitive data visible
- [ ] All text is readable at displayed size

---

## Need Help Creating Promo Tiles?

### Option 1: Use Figma (Free)
1. Go to https://figma.com
2. Create new file
3. Use Frame tool: 440x280 or 1400x560
4. Add your design elements
5. Export as PNG

### Option 2: Use Canva (Free)
1. Go to https://canva.com
2. Create custom dimensions
3. Use templates or design from scratch
4. Download as PNG

### Option 3: Simple HTML/CSS
I can create HTML files that you can screenshot at the exact dimensions needed!

---

## Quick HTML Promo Generator

Want me to create HTML files you can open in browser and screenshot? Let me know and I'll generate:
- Small promo tile (440x280) HTML
- Marquee promo tile (1400x560) HTML
- Both will be pre-sized and ready to screenshot
