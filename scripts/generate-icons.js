const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateIcons() {
  const iconSizes = [192, 512];
  const faviconSizes = [16, 32, 48, 64, 96, 128, 256];
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

  // Generate Apple Touch Icons
  await sharp(sourceIcon)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconDir, 'apple-touch-icon.png'));

  await sharp(sourceIcon)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconDir, 'apple-touch-icon-precomposed.png'));

  // Generate favicons in multiple sizes
  for (const size of faviconSizes) {
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(path.join(iconDir, `favicon-${size}x${size}.png`));
  }

  // Generate ICO file
  const icoBuffer = await sharp(sourceIcon)
    .resize(32, 32)
    .toFormat('png')
    .toBuffer();

  await fs.writeFile(path.join(__dirname, '../public/icons/favicon.ico'), icoBuffer);

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error); 