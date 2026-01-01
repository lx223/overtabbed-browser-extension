/**
 * Script to generate icons for the Chrome extension
 * Creates colorful tab manager icons in PNG format
 */

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const iconSizes: readonly number[] = [16, 48, 128];
const publicIconsDir = join(__dirname, '..', 'public', 'icons');

// Ensure directory exists
if (!existsSync(publicIconsDir)) {
  mkdirSync(publicIconsDir, { recursive: true });
}

// Generate icons
async function generateIcon(size: number): Promise<void> {
  // Create SVG with gradient background and tab representation
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad${size})"/>
      <g transform="translate(${size * 0.15}, ${size * 0.15})">
        <!-- Tab representation - stacked tabs -->
        <rect x="0" y="0" width="${size * 0.7}" height="${size * 0.12}" rx="${size * 0.03}" fill="white" opacity="0.95"/>
        <rect x="0" y="${size * 0.18}" width="${size * 0.6}" height="${size * 0.12}" rx="${size * 0.03}" fill="white" opacity="0.85"/>
        <rect x="0" y="${size * 0.36}" width="${size * 0.65}" height="${size * 0.12}" rx="${size * 0.03}" fill="white" opacity="0.75"/>
        <rect x="0" y="${size * 0.54}" width="${size * 0.55}" height="${size * 0.12}" rx="${size * 0.03}" fill="white" opacity="0.65"/>
      </g>
    </svg>
  `;

  // Convert SVG to PNG
  const pngBuffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  // Save PNG file
  const outputPath = join(publicIconsDir, `icon${size}.png`);
  await sharp(pngBuffer).toFile(outputPath);
  
  console.log(`✓ Generated icon${size}.png`);
}

// Generate all icons
async function generateAllIcons(): Promise<void> {
  console.log('Generating extension icons...\n');
  
  for (const size of iconSizes) {
    await generateIcon(size);
  }
  
  console.log('\n✓ All icons generated successfully!');
  console.log(`Icons saved to: ${publicIconsDir}`);
}

generateAllIcons().catch(console.error);

