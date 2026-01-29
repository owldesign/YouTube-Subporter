# YouTube Subporter Icons

## Preview

Open `preview.html` in your browser to see all icon variations and how they look in different contexts.

## Icon Design

The icons feature a YouTube-inspired design with:
- **YouTube Red** (#FF0000) background with rounded corners
- **White** rectangular inset (inspired by YouTube's play button aesthetic)
- **Dual arrows** representing import (down) and export (up) functionality
- **Modern, flat design** that works well at all sizes

## Files

### PNG Format (Recommended)
- `icon-16.png` - 16×16 pixels (toolbar icon)
- `icon-48.png` - 48×48 pixels (extension manager)
- `icon-128.png` - 128×128 pixels (Chrome Web Store listing)

### SVG Format (Source)
- `icon-16.svg` - Scalable version
- `icon-48.svg` - Scalable version
- `icon-128.svg` - Scalable version

## Usage

These icons are already configured in `manifest.json`:

```json
{
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  }
}
```

## Customization

If you want to modify the icons:

1. Edit the SVG files (they're plain XML)
2. Use the Node.js script in the parent directory to regenerate PNGs
3. Or use any design tool (Figma, Sketch, Adobe XD, etc.)

### Regenerating PNGs from SVG


```bash
magick -background none icon-128.svg icon-128.png
magick -background none icon-48.svg icon-48.png
magick -background none icon-16.svg icon-16.png
```

## Color Scheme

- **Primary:** #FF0000 (YouTube Red)
- **Secondary:** #FFFFFF (White)
- **Transparency:** RGBA format with alpha channel

## Design Rationale

The dual-arrow design was chosen because:
1. **Clear functionality** - Immediately communicates import/export
2. **YouTube connection** - Red color ties to YouTube branding
3. **Professional** - Clean, modern aesthetic
4. **Scalable** - Works well at all sizes (16px to 128px)
5. **Distinct** - Stands out in browser toolbar

## Chrome Web Store Guidelines

These icons meet Chrome Web Store requirements:
- ✅ PNG format with transparency
- ✅ Required sizes: 16×16, 48×48, 128×128
- ✅ Square aspect ratio
- ✅ Proper resolution and clarity
- ✅ No anti-aliasing issues
- ✅ Looks good on light and dark backgrounds

## Testing

After updating icons:
1. Reload the extension in `chrome://extensions/`
2. Check toolbar icon (16px)
3. Check extension card (48px)
4. Check in extension manager details (128px)
5. Test on both light and dark Chrome themes
