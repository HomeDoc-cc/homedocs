import { prisma } from "../src/lib/db";
import { hash } from "bcryptjs";

async function main() {
  try {
    // Create users
    const user1 = await prisma.user.upsert({
      where: { email: "user1@example.com" },
      update: {},
      create: {
        email: "user1@example.com",
        name: "User One",
        password: await hash("password123", 12),
      },
    });

    const user2 = await prisma.user.upsert({
      where: { email: "user2@example.com" },
      update: {},
      create: {
        email: "user2@example.com",
        name: "User Two",
        password: await hash("password123", 12),
      },
    });

    // Create homes
    const home1 = await prisma.home.create({
      data: {
        name: "Modern Townhouse",
        address: "123 Main St",
        description: "A beautiful modern townhouse",
        userId: user1.id,
        // Share with user2
        shares: {
          create: {
            userId: user2.id,
            role: "WRITE",
          },
        },
      },
    });

    const home2 = await prisma.home.create({
      data: {
        name: "Beach House",
        address: "456 Ocean Ave",
        description: "Relaxing beach house with ocean views",
        userId: user2.id,
      },
    });

    // Create rooms for home1
    const livingRoom = await prisma.room.create({
      data: {
        name: "Living Room",
        description: "Main living area with fireplace",
        homeId: home1.id,
      },
    });

    const kitchen = await prisma.room.create({
      data: {
        name: "Kitchen",
        description: "Modern kitchen with island",
        homeId: home1.id,
      },
    });

    const masterBedroom = await prisma.room.create({
      data: {
        name: "Master Bedroom",
        description: "Spacious master bedroom with ensuite",
        homeId: home1.id,
      },
    });

    // Create items for the living room
    await prisma.item.create({
      data: {
        name: "Smart TV",
        description: "65-inch OLED TV",
        category: "Electronics",
        manufacturer: "LG",
        modelNumber: "OLED65C1",
        serialNumber: "123456789",
        purchaseDate: new Date("2023-01-15"),
        warrantyUntil: new Date("2025-01-15"),
        manualUrl: "https://www.lg.com/manual.pdf",
        roomId: livingRoom.id,
        homeId: home1.id,
      },
    });

    await prisma.item.create({
      data: {
        name: "Sofa",
        description: "3-seater leather sofa",
        category: "Furniture",
        manufacturer: "Ashley Furniture",
        modelNumber: "AS-123",
        purchaseDate: new Date("2023-02-01"),
        warrantyUntil: new Date("2026-02-01"),
        roomId: livingRoom.id,
        homeId: home1.id,
      },
    });

    // Create items for the kitchen
    await prisma.item.create({
      data: {
        name: "Refrigerator",
        description: "French door refrigerator",
        category: "Appliances",
        manufacturer: "Samsung",
        modelNumber: "RF28T5001",
        serialNumber: "987654321",
        purchaseDate: new Date("2023-01-20"),
        warrantyUntil: new Date("2028-01-20"),
        manualUrl: "https://www.samsung.com/manual.pdf",
        roomId: kitchen.id,
        homeId: home1.id,
      },
    });

    // Create tasks
    await prisma.task.create({
      data: {
        title: "Clean Living Room",
        description: "Vacuum and dust the living room",
        priority: "MEDIUM",
        status: "PENDING",
        dueDate: new Date("2024-03-01"),
        creatorId: user1.id,
        assigneeId: user2.id,
        homeId: home1.id,
        roomId: livingRoom.id,
      },
    });

    await prisma.task.create({
      data: {
        title: "Fix Kitchen Sink",
        description: "Repair leaking kitchen sink",
        priority: "HIGH",
        status: "IN_PROGRESS",
        dueDate: new Date("2024-02-25"),
        creatorId: user2.id,
        assigneeId: user1.id,
        homeId: home1.id,
        roomId: kitchen.id,
      },
    });

    // Create paint records
    await prisma.paint.create({
      data: {
        name: "Living Room Walls",
        brand: "Benjamin Moore",
        color: "Revere Pewter",
        finish: "EGGSHELL",
        roomId: livingRoom.id,
        homeId: home1.id,
      },
    });

    // Create flooring records
    await prisma.flooring.create({
      data: {
        name: "Living Room Hardwood",
        type: "Hardwood",
        material: "Oak",
        brand: "Bruce",
        color: "Natural",
        pattern: "Plank",
        roomId: livingRoom.id,
        homeId: home1.id,
      },
    });

    console.log("Sample data created successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 