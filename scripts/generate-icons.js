const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const iconSizes = [192, 512];
  const sourceIcon = path.join(__dirname, '../public/icon.jpg');
  const iconDir = path.join(__dirname, '../public/icons');

  // Create icons directory if it doesn't exist
  try {
    await fs.mkdir(iconDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  // Generate PWA icons
  for (const size of iconSizes) {
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(path.join(iconDir, `icon-${size}x${size}.png`));
  }

  // Generate Apple Touch Icon
  await sharp(sourceIcon)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconDir, 'apple-touch-icon.png'));

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error); 