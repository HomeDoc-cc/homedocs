import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePaintColors() {
  try {
    // Get all paints that have a code but no hexColor
    const paints = await prisma.paint.findMany({
      where: {
        code: { not: null },
        hexColor: null,
      },
    });

    console.log(`Found ${paints.length} paints to update`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const paint of paints) {
      if (!paint.code) continue;

      // Look up the color
      const color = await prisma.color.findUnique({
        where: { code: paint.code },
        select: { hex: true },
      });

      if (color) {
        // Update the paint with the hex color
        await prisma.paint.update({
          where: { id: paint.id },
          data: { hexColor: color.hex },
        });
        updatedCount++;
        console.log(`Updated paint ${paint.name} with hex color ${color.hex}`);
      } else {
        skippedCount++;
        console.log(`No color found for code ${paint.code} (paint: ${paint.name})`);
      }
    }

    console.log(`\nUpdate complete:`);
    console.log(`- Updated: ${updatedCount} paints`);
    console.log(`- Skipped: ${skippedCount} paints (no matching color found)`);

  } catch (error) {
    console.error('Error updating paint colors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updatePaintColors(); 