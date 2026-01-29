#!/usr/bin/env node

/**
 * Automated Screenshot Capture for Promo Tiles
 *
 * This script captures screenshots of the promo tile HTML files
 * at the exact dimensions required for Chrome Web Store.
 *
 * Requirements:
 *   npm install puppeteer
 *
 * Usage:
 *   node capture-promo-tiles.js
 */

const fs = require('fs');
const path = require('path');

// Check if puppeteer is available
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  console.log('❌ Puppeteer not installed');
  console.log('');
  console.log('Install it with:');
  console.log('  npm install puppeteer');
  console.log('');
  console.log('Or capture screenshots manually using your browser.');
  process.exit(1);
}

async function capturePromoTiles() {
  console.log('🚀 Starting promo tile capture...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: null
  });

  const page = await browser.newPage();

  try {
    // Capture Small Promo Tile (440x280)
    console.log('📸 Capturing small promo tile (440x280)...');
    await page.setViewport({
      width: 440,
      height: 280,
      deviceScaleFactor: 2 // For retina quality
    });

    const smallPromoPath = path.join(__dirname, 'small-promo-440x280.html');
    await page.goto(`file://${smallPromoPath}`, { waitUntil: 'networkidle0' });

    // Wait a bit for fonts to load
    await page.waitForTimeout(1000);

    // Screenshot only the promo tile
    const smallElement = await page.$('.promo-tile');
    if (smallElement) {
      await smallElement.screenshot({
        path: 'small-promo-440x280.png',
        type: 'png'
      });
      console.log('✅ Saved: small-promo-440x280.png\n');
    }

    // Capture Marquee Promo Tile (1400x560)
    console.log('📸 Capturing marquee promo tile (1400x560)...');
    await page.setViewport({
      width: 1400,
      height: 560,
      deviceScaleFactor: 2 // For retina quality
    });

    const marqueePromoPath = path.join(__dirname, 'marquee-promo-1400x560.html');
    await page.goto(`file://${marqueePromoPath}`, { waitUntil: 'networkidle0' });

    // Wait for fonts
    await page.waitForTimeout(1000);

    // Screenshot only the promo tile
    const marqueeElement = await page.$('.promo-tile');
    if (marqueeElement) {
      await marqueeElement.screenshot({
        path: 'marquee-promo-1400x560.png',
        type: 'png'
      });
      console.log('✅ Saved: marquee-promo-1400x560.png\n');
    }

    // Check file sizes
    console.log('📊 File Information:\n');

    const smallStats = fs.statSync('small-promo-440x280.png');
    const smallSizeKB = (smallStats.size / 1024).toFixed(2);
    const smallSizeMB = (smallStats.size / 1024 / 1024).toFixed(2);
    console.log(`Small Promo: ${smallSizeKB} KB (${smallSizeMB} MB)`);
    if (smallStats.size > 1024 * 1024) {
      console.log('⚠️  Warning: File size exceeds 1MB limit!');
    }

    const marqueeStats = fs.statSync('marquee-promo-1400x560.png');
    const marqueeSizeKB = (marqueeStats.size / 1024).toFixed(2);
    const marqueeSizeMB = (marqueeStats.size / 1024 / 1024).toFixed(2);
    console.log(`Marquee Promo: ${marqueeSizeKB} KB (${marqueeSizeMB} MB)`);
    if (marqueeStats.size > 2 * 1024 * 1024) {
      console.log('⚠️  Warning: File size exceeds 2MB limit!');
    }

    console.log('\n✨ All promo tiles captured successfully!\n');
    console.log('Next steps:');
    console.log('  1. Review the generated PNG files');
    console.log('  2. Verify dimensions and quality');
    console.log('  3. Upload to Chrome Web Store');

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Run the capture
capturePromoTiles().catch(console.error);
