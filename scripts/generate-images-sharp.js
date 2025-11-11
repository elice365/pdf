const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// Create a simple SVG and convert to PNG
async function generateImage(width, height, fileName, content) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${content}
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(publicDir, fileName));

  console.log(`✓ Generated ${fileName}`);
}

async function main() {
  console.log('Generating images...\n');

  // OG Image (1200x630)
  await generateImage(1200, 630, 'og-image.png', `
    <defs>
      <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#c40e2d;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#a00c26;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg1)"/>
    <rect x="100" y="100" width="350" height="430" fill="rgba(255, 255, 255, 0.1)" rx="10"/>
    <text x="275" y="340" font-family="Arial, sans-serif" font-size="180" font-weight="bold" fill="#ffffff" text-anchor="middle">PDF</text>
    <text x="500" y="220" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#ffffff">iLovePDF</text>
    <text x="500" y="290" font-family="Arial, sans-serif" font-size="42" fill="#ffffff">Online PDF Tools</text>
    <text x="500" y="360" font-family="Arial, sans-serif" font-size="28" fill="rgba(255, 255, 255, 0.9)">✓ Merge &amp; Split PDFs</text>
    <text x="500" y="405" font-family="Arial, sans-serif" font-size="28" fill="rgba(255, 255, 255, 0.9)">✓ Compress &amp; Convert</text>
    <text x="500" y="450" font-family="Arial, sans-serif" font-size="28" fill="rgba(255, 255, 255, 0.9)">✓ Edit &amp; Sign</text>
    <text x="500" y="495" font-family="Arial, sans-serif" font-size="28" fill="rgba(255, 255, 255, 0.9)">✓ Free &amp; Easy to Use</text>
  `);

  // Twitter Image (1200x600)
  await generateImage(1200, 600, 'twitter-image.png', `
    <defs>
      <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#c40e2d;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#a00c26;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1200" height="600" fill="url(#bg2)"/>
    <text x="600" y="320" font-family="Arial, sans-serif" font-size="300" font-weight="bold" fill="rgba(255, 255, 255, 0.15)" text-anchor="middle">PDF</text>
    <text x="600" y="220" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="#ffffff" text-anchor="middle">iLovePDF</text>
    <text x="600" y="420" font-family="Arial, sans-serif" font-size="40" fill="#ffffff" text-anchor="middle">Free Online PDF Tools</text>
  `);

  // Favicon 32x32
  await generateImage(32, 32, 'favicon-32x32.png', `
    <rect width="32" height="32" fill="#c40e2d"/>
    <text x="16" y="21" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">PDF</text>
  `);

  // Favicon 16x16
  await generateImage(16, 16, 'favicon-16x16.png', `
    <rect width="16" height="16" fill="#c40e2d"/>
    <rect x="4" y="3" width="8" height="10" fill="#ffffff"/>
    <rect x="5" y="6" width="6" height="2" fill="#c40e2d"/>
  `);

  // Apple Touch Icon 180x180
  await generateImage(180, 180, 'apple-touch-icon.png', `
    <rect width="180" height="180" fill="#c40e2d"/>
    <rect x="30" y="30" width="120" height="120" fill="rgba(255, 255, 255, 0.2)" rx="10"/>
    <text x="90" y="110" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="#ffffff" text-anchor="middle">PDF</text>
  `);

  // Android Chrome 192x192
  await generateImage(192, 192, 'android-chrome-192x192.png', `
    <rect width="192" height="192" fill="#c40e2d"/>
    <rect x="40" y="40" width="112" height="112" fill="rgba(255, 255, 255, 0.15)" rx="10"/>
    <text x="96" y="116" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle">PDF</text>
  `);

  // Android Chrome 512x512
  await generateImage(512, 512, 'android-chrome-512x512.png', `
    <rect width="512" height="512" fill="#c40e2d"/>
    <rect x="100" y="100" width="312" height="312" fill="rgba(255, 255, 255, 0.15)" rx="20"/>
    <text x="256" y="300" font-family="Arial, sans-serif" font-size="180" font-weight="bold" fill="#ffffff" text-anchor="middle">PDF</text>
    <text x="256" y="400" font-family="Arial, sans-serif" font-size="48" fill="#ffffff" text-anchor="middle">iLovePDF</text>
  `);

  console.log('\nAll images generated successfully!');
}

main().catch(console.error);
