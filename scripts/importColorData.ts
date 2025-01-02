import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ColorData {
  code: string; // hex color code or rgb format
  label: string | number; // color code/number (can be numeric)
  name: string; // color name
  book: string; // manufacturer/brand
}

// Function to convert RGB format to hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

// Function to parse RGB string format "rgb(r, g, b)"
function parseRgb(rgb: string): { r: number; g: number; b: number } | null {
  try {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing RGB string:', rgb, error);
    return null;
  }
}

async function refreshColorData() {
  const sourceUrl = 'https://raw.githubusercontent.com/ryancwalsh/paint_color_gallery/refs/heads/main/data/colornerd.json';
  const response = await fetch(sourceUrl);
  const data = await response.json();
  const colorDataPath = join(__dirname, 'data', 'colordata.json');
  try { 
    writeFileSync(colorDataPath, JSON.stringify(data, null, 2));
    console.log('Color data refreshed successfully');
  } catch (error) {
    console.error('Error refreshing color data:', error);
  }
}

// Function to ensure hex code is properly formatted
function formatHexCode(
  color: string
): { hex: string; rgb: { r: number; g: number; b: number } } | null {
  try {
    // Check if it's an RGB format
    if (color.startsWith('rgb(')) {
      const rgb = parseRgb(color);
      if (rgb) {
        return {
          hex: rgbToHex(rgb.r, rgb.g, rgb.b),
          rgb,
        };
      }
      return null;
    }

    // Handle hex format
    let hex = color;
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }

    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }

    return {
      hex,
      rgb: { r, g, b },
    };
  } catch (error) {
    console.error('Error processing color:', color, error);
    return null;
  }
}

const prisma = new PrismaClient();

async function main(force = false) {
  try {
    // Check if we already have color data
    const existingCount = await prisma.color.count();
    
    if (existingCount > 0 && !force) {
      console.log('Paint color data already exists. Use --force to reimport.');
      return;
    }

    await refreshColorData();

    // First, clean up existing color data
    await prisma.color.deleteMany({});
    console.log('Cleaned up existing color data');
    
    // Read the color data JSON file
    const colorDataPath = join(__dirname, 'data', 'colordata.json');
    const colorData: ColorData[] = JSON.parse(readFileSync(colorDataPath, 'utf-8'));

    console.log(`Found ${colorData.length} colors to import`);

    // Create colors in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < colorData.length; i += batchSize) {
      const batch = colorData.slice(i, i + batchSize);
      const validColors = batch
        .map((color) => {
          const colorInfo = formatHexCode(color.code);
          if (!colorInfo) {
            console.warn(`Skipping invalid color code: ${color.code} for ${color.name}`);
            return null;
          }
          return {
            code: String(color.label), // Convert label to string (handles both string and number)
            name: color.name,
            brand: color.book,
            hex: colorInfo.hex,
            rgbR: colorInfo.rgb.r,
            rgbG: colorInfo.rgb.g,
            rgbB: colorInfo.rgb.b,
          };
        })
        .filter((color): color is NonNullable<typeof color> => color !== null);

      if (validColors.length > 0) {
        await prisma.color.createMany({
          data: validColors,
          skipDuplicates: true,
        });
      }
      console.log(`Imported colors ${i + 1} to ${i + batch.length}`);
    }

    console.log('Color data import completed successfully');
  } catch (error) {
    console.error('Error importing color data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if --force flag is passed
const force = process.argv.includes('--force');
main(force)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
