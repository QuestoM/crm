const fs = require('fs');
const path = require('path');

// Make sure the public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  console.log('Creating public directory...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Simple base64 encoded SVG blue water drop logo
const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1E40AF"/>
    </linearGradient>
  </defs>
  <path fill="url(#a)" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm0-121.2c-39.5 0-71.7-32.2-71.7-71.7 0-28.9 34.3-79.2 66.1-132.6 4.1-6.9 14.3-6.9 18.4 0 31.8 53.4 66.1 103.7 66.1 132.6 0 39.6-32.2 71.7-71.7 71.7z"/>
</svg>`;

try {
  // Create favicon.ico
  console.log('Creating favicon.ico...');
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), logoSvg);

  // Create logo192.png
  console.log('Creating logo192.png...');
  fs.writeFileSync(path.join(publicDir, 'logo192.png'), logoSvg);

  // Create logo512.png
  console.log('Creating logo512.png...');
  fs.writeFileSync(path.join(publicDir, 'logo512.png'), logoSvg);

  console.log('Logo files created successfully!');
} catch (error) {
  console.error('Error creating logo files:', error);
  process.exit(1);
} 