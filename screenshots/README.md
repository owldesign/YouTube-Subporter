# Screenshots for Chrome Web Store

## What You Need

### 5 Main Screenshots (Required)
- **Size**: 1280x800 pixels
- **Format**: PNG or JPG
- **Max size**: 5MB each

### Small Promo Tile (Optional)
- **Size**: 440x280 pixels
- **Format**: PNG or JPG
- **Max size**: 1MB

### Marquee Promo Tile (Optional)
- **Size**: 1400x560 pixels
- **Format**: PNG or JPG
- **Max size**: 2MB

---

## Quick Start

### Step 1: Capture Promo Tiles

I've created ready-to-screenshot HTML files:

```bash
# Open in browser
open small-promo-440x280.html
open marquee-promo-1400x560.html
```

**To capture:**
1. Open the HTML file in Chrome
2. Right-click → Inspect
3. Toggle Device Toolbar (Cmd+Shift+M)
4. Set dimensions (440x280 or 1400x560)
5. Take screenshot (DevTools → ... → Capture screenshot)

---

### Step 2: Capture Extension Screenshots

**Method 1: Using Extension Directly**

1. Load the extension in Chrome
2. Navigate to YouTube
3. Click the extension icon
4. Take screenshots of different states

**Method 2: Using DevTools Device Mode**

1. Open the popup
2. Right-click → Inspect
3. Toggle Device Toolbar
4. Set to 400x600 (popup size)
5. Capture different screens

---

## Suggested Screenshots

### Screenshot 1: Main Interface
**Show**: Export and Import sections
- Clean interface
- Both main action buttons visible
- Advanced Tools buttons
- Settings toggle

**Caption**: "Clean, intuitive interface for exporting and importing subscriptions"

---

### Screenshot 2: Settings Expanded
**Show**: Settings panel open with sliders
- All three sliders visible
- Values shown
- Save button

**Caption**: "Configurable settings to control import speed and avoid rate limiting"

---

### Screenshot 3: Import in Progress
**Show**: Active import with progress
- Progress bar moving
- Current channel being subscribed
- Success/Failed/Skipped stats
- Pause and Cancel buttons

**Caption**: "Real-time progress tracking with pause, resume, and cancel controls"

---

### Screenshot 4: Compare Feature
**Show**: Compare modal with results
- Two files uploaded
- Comparison statistics
- Export Differences button

**Caption**: "Compare subscription lists between accounts to find differences"

---

### Screenshot 5: Filter or Merge
**Show**: Filter modal with applied filters OR Merge results
- Filter inputs with criteria
- OR Merge with multiple files
- Results displayed

**Caption**: "Advanced filtering and merging tools for power users"

---

## Resizing Screenshots

### Option 1: ImageMagick (CLI)

```bash
# Resize to 1280x800 with white background
magick input.png -resize 1280x800 -background white -gravity center -extent 1280x800 output.png

# Batch resize all screenshots
for f in screenshot-*.png; do
  magick "$f" -resize 1280x800 -background white -gravity center -extent 1280x800 "store-$f"
done
```

### Option 2: macOS Preview

1. Open screenshot in Preview
2. Tools → Adjust Size
3. Width: 1280, Height: 800
4. Uncheck "Scale proportionally" if needed
5. File → Export as PNG

### Option 3: Online Tool

- https://www.iloveimg.com/resize-image
- Upload, set to 1280x800, download

---

## File Naming Convention

Use descriptive names:
- `01-main-interface.png`
- `02-settings-panel.png`
- `03-import-progress.png`
- `04-compare-feature.png`
- `05-filter-merge.png`
- `small-promo-440x280.png`
- `marquee-promo-1400x560.png`

---

## Quality Checklist

Before uploading to Chrome Web Store:

- [ ] All screenshots are exactly 1280x800
- [ ] File sizes under 5MB
- [ ] PNG format (preferred) or high-quality JPG
- [ ] No blurry or pixelated images
- [ ] No personal information visible
- [ ] Text is readable
- [ ] Shows actual extension features
- [ ] Professional appearance
- [ ] Promo tiles are 440x280 and 1400x560

---

## Taking Perfect Screenshots

### For Popup Interface

```javascript
// Run this in browser console to set exact size
const popup = window.open('popup/popup.html', 'popup', 'width=400,height=600');
```

### For Modal Screenshots

1. Open extension
2. Click Compare/Filter/Merge
3. Interact to show results
4. Use browser's screenshot tool (Cmd+Shift+P → "screenshot")

### For Progress Screenshots

1. Create a test JSON file with 5-10 channels
2. Start import
3. Quickly take screenshot while it's running
4. Or use browser DevTools to pause JavaScript execution

---

## Example Screenshot Tool Commands

### Firefox (Best for full page)
1. Right-click → Take Screenshot
2. Choose "Save full page" or "Save visible"

### Chrome DevTools
1. Cmd+Shift+P (Windows: Ctrl+Shift+P)
2. Type "screenshot"
3. Choose "Capture area screenshot" or "Capture node screenshot"

### macOS Native
```bash
# Interactive selection
Cmd + Shift + 4

# Window capture
Cmd + Shift + 4, then Space
```

---

## Tips for Great Screenshots

1. **Clean Background**: Use a fresh YouTube tab
2. **Realistic Data**: Use real or realistic test data
3. **Highlight Features**: Show the extension doing something useful
4. **Good Lighting**: Ensure UI elements are clearly visible
5. **No Errors**: Don't show error states
6. **Professional**: Clean, polished appearance

---

## Ready-Made Files

In this directory:
- `small-promo-440x280.html` - Small promo tile (open & screenshot)
- `marquee-promo-1400x560.html` - Marquee promo tile (open & screenshot)
- `SCREENSHOTS_GUIDE.md` - Detailed guide

---

## Need Help?

Can't generate screenshots yourself? Options:

1. **Use HTML files provided** - Just open and screenshot
2. **Ask a designer** - Share the extension and requirements
3. **Use Figma/Canva** - Create mockups based on actual UI
4. **Automated tools** - Use Puppeteer/Playwright for automation

---

Good luck with your Chrome Web Store submission! 🚀
