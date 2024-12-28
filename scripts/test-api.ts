import { getTestUserToken } from "../src/lib/test.utils";
import { TaskPriority, TaskStatus, TaskRecurrenceUnit } from "@/types/prisma";

async function main() {
  // Get test token
  const token = await getTestUserToken();
  console.log("Test token:", token);

  // Test creating a home
  const createHomeResponse = await fetch("http://localhost:3000/api/homes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `next-auth.session-token=${token}`,
    },
    body: JSON.stringify({
      name: "My Test Home",
      address: "123 Test St",
    }),
  });

  if (!createHomeResponse.ok) {
    console.error("Failed to create home:", await createHomeResponse.text());
    process.exit(1);
  }

  const home = await createHomeResponse.json();
  console.log("Created home:", home);

  // Test getting all homes
  const getHomesResponse = await fetch("http://localhost:3000/api/homes", {
    headers: {
      Cookie: `next-auth.session-token=${token}`,
    },
  });

  if (!getHomesResponse.ok) {
    console.error("Failed to get homes:", await getHomesResponse.text());
    process.exit(1);
  }

  const homes = await getHomesResponse.json();
  console.log("All homes:", homes);

  // Test getting a single home
  const getHomeResponse = await fetch(
    `http://localhost:3000/api/homes/${home.id}`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getHomeResponse.ok) {
    console.error("Failed to get home:", await getHomeResponse.text());
    process.exit(1);
  }

  const singleHome = await getHomeResponse.json();
  console.log("Single home:", singleHome);

  // Test creating a room
  const createRoomResponse = await fetch(
    `http://localhost:3000/api/homes/${home.id}/rooms`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        name: "Living Room",
        description: "The main living area",
      }),
    }
  );

  if (!createRoomResponse.ok) {
    console.error("Failed to create room:", await createRoomResponse.text());
    process.exit(1);
  }

  const room = await createRoomResponse.json();
  console.log("Created room:", room);

  // Test getting all rooms
  const getRoomsResponse = await fetch(
    `http://localhost:3000/api/homes/${home.id}/rooms`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getRoomsResponse.ok) {
    console.error("Failed to get rooms:", await getRoomsResponse.text());
    process.exit(1);
  }

  const rooms = await getRoomsResponse.json();
  console.log("All rooms:", rooms);

  // Test getting a single room
  const getRoomResponse = await fetch(
    `http://localhost:3000/api/rooms/${room.id}`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getRoomResponse.ok) {
    console.error("Failed to get room:", await getRoomResponse.text());
    process.exit(1);
  }

  const singleRoom = await getRoomResponse.json();
  console.log("Single room:", singleRoom);

  // Test updating a room
  const updateRoomResponse = await fetch(
    `http://localhost:3000/api/rooms/${room.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        name: "Updated Living Room",
        description: "Updated main living area",
      }),
    }
  );

  if (!updateRoomResponse.ok) {
    console.error("Failed to update room:", await updateRoomResponse.text());
    process.exit(1);
  }

  const updatedRoom = await updateRoomResponse.json();
  console.log("Updated room:", updatedRoom);

  // Test creating an item
  const createItemResponse = await fetch(
    `http://localhost:3000/api/rooms/${room.id}/items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        name: "TV",
        description: "65-inch OLED TV",
        category: "Electronics",
        manufacturer: "LG",
        modelNumber: "OLED65C1",
        serialNumber: "123456789",
        purchaseDate: new Date().toISOString(),
        warrantyUntil: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
        manualUrl: "https://www.lg.com/manual.pdf",
      }),
    }
  );

  if (!createItemResponse.ok) {
    console.error("Failed to create item:", await createItemResponse.text());
    process.exit(1);
  }

  const item = await createItemResponse.json();
  console.log("Created item:", item);

  // Test getting all items
  const getItemsResponse = await fetch(
    `http://localhost:3000/api/rooms/${room.id}/items`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getItemsResponse.ok) {
    console.error("Failed to get items:", await getItemsResponse.text());
    process.exit(1);
  }

  const items = await getItemsResponse.json();
  console.log("All items:", items);

  // Test getting a single item
  const getItemResponse = await fetch(
    `http://localhost:3000/api/items/${item.id}`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getItemResponse.ok) {
    console.error("Failed to get item:", await getItemResponse.text());
    process.exit(1);
  }

  const singleItem = await getItemResponse.json();
  console.log("Single item:", singleItem);

  // Test updating an item
  const updateItemResponse = await fetch(
    `http://localhost:3000/api/items/${item.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        name: "Updated TV",
        description: "77-inch OLED TV",
      }),
    }
  );

  if (!updateItemResponse.ok) {
    console.error("Failed to update item:", await updateItemResponse.text());
    process.exit(1);
  }

  const updatedItem = await updateItemResponse.json();
  console.log("Updated item:", updatedItem);

  // Test creating paint for a home
  const createHomePaintResponse = await fetch(
    `http://localhost:3000/api/homes/${home.id}/paint`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        name: "Living Room Walls",
        brand: "Sherwin-Williams",
        color: "Agreeable Gray",
        finish: "Eggshell",
        code: "SW 7029",
        location: "Walls",
        notes: "Used in main living areas",
      }),
    }
  );

  if (!createHomePaintResponse.ok) {
    console.error(
      "Failed to create home paint:",
      await createHomePaintResponse.text()
    );
    process.exit(1);
  }

  const homePaint = await createHomePaintResponse.json();
  console.log("Created home paint:", homePaint);

  // Test getting paint for a home
  const getHomePaintResponse = await fetch(
    `http://localhost:3000/api/homes/${home.id}/paint`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getHomePaintResponse.ok) {
    console.error(
      "Failed to get home paint:",
      await getHomePaintResponse.text()
    );
    process.exit(1);
  }

  const homePaints = await getHomePaintResponse.json();
  console.log("All home paints:", homePaints);

  // Test creating paint for a room
  const createRoomPaintResponse = await fetch(
    `http://localhost:3000/api/rooms/${room.id}/paint`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        name: "Living Room Trim",
        brand: "Sherwin-Williams",
        color: "Pure White",
        finish: "Semi-Gloss",
        code: "SW 7005",
        location: "Trim",
        notes: "Used for all trim work",
      }),
    }
  );

  if (!createRoomPaintResponse.ok) {
    console.error(
      "Failed to create room paint:",
      await createRoomPaintResponse.text()
    );
    process.exit(1);
  }

  const roomPaint = await createRoomPaintResponse.json();
  console.log("Created room paint:", roomPaint);

  // Test getting paint for a room
  const getRoomPaintResponse = await fetch(
    `http://localhost:3000/api/rooms/${room.id}/paint`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getRoomPaintResponse.ok) {
    console.error(
      "Failed to get room paint:",
      await getRoomPaintResponse.text()
    );
    process.exit(1);
  }

  const roomPaints = await getRoomPaintResponse.json();
  console.log("All room paints:", roomPaints);

  // Test updating paint
  const updatePaintResponse = await fetch(
    `http://localhost:3000/api/paint/${roomPaint.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        notes: "Updated notes for trim paint",
      }),
    }
  );

  if (!updatePaintResponse.ok) {
    console.error("Failed to update paint:", await updatePaintResponse.text());
    process.exit(1);
  }

  const updatedPaint = await updatePaintResponse.json();
  console.log("Updated paint:", updatedPaint);

  // Test creating flooring for a home
  const createHomeFlooringResponse = await fetch(
    `http://localhost:3000/api/homes/${home.id}/flooring`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        name: "Living Room Floor",
        type: "Hardwood",
        material: "Oak",
        brand: "Bruce",
        color: "Natural",
        pattern: "Plank",
        notes: "3/4 inch solid hardwood",
      }),
    }
  );

  if (!createHomeFlooringResponse.ok) {
    console.error(
      "Failed to create home flooring:",
      await createHomeFlooringResponse.text()
    );
    process.exit(1);
  }

  const homeFlooring = await createHomeFlooringResponse.json();
  console.log("Created home flooring:", homeFlooring);

  // Test getting flooring for a home
  const getHomeFlooringResponse = await fetch(
    `http://localhost:3000/api/homes/${home.id}/flooring`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getHomeFlooringResponse.ok) {
    console.error(
      "Failed to get home flooring:",
      await getHomeFlooringResponse.text()
    );
    process.exit(1);
  }

  const homeFloorings = await getHomeFlooringResponse.json();
  console.log("All home floorings:", homeFloorings);

  // Test creating flooring for a room
  const createRoomFlooringResponse = await fetch(
    `http://localhost:3000/api/rooms/${room.id}/flooring`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        name: "Living Room Floor",
        type: "Hardwood",
        material: "Oak",
        brand: "Bruce",
        color: "Natural",
        pattern: "Plank",
        notes: "3/4 inch solid hardwood",
      }),
    }
  );

  if (!createRoomFlooringResponse.ok) {
    console.error(
      "Failed to create room flooring:",
      await createRoomFlooringResponse.text()
    );
    process.exit(1);
  }

  const roomFlooring = await createRoomFlooringResponse.json();
  console.log("Created room flooring:", roomFlooring);

  // Test getting flooring for a room
  const getRoomFlooringResponse = await fetch(
    `http://localhost:3000/api/rooms/${room.id}/flooring`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getRoomFlooringResponse.ok) {
    console.error(
      "Failed to get room flooring:",
      await getRoomFlooringResponse.text()
    );
    process.exit(1);
  }

  const roomFloorings = await getRoomFlooringResponse.json();
  console.log("All room floorings:", roomFloorings);

  // Test updating flooring
  const updateFlooringResponse = await fetch(
    `http://localhost:3000/api/flooring/${roomFlooring.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        notes: "Updated notes for carpet",
      }),
    }
  );

  if (!updateFlooringResponse.ok) {
    console.error(
      "Failed to update flooring:",
      await updateFlooringResponse.text()
    );
    process.exit(1);
  }

  const updatedFlooring = await updateFlooringResponse.json();
  console.log("Updated flooring:", updatedFlooring);

  // Test creating a task for a home
  const createHomeTaskResponse = await fetch(
    `http://localhost:3000/api/homes/${home.id}/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        title: "Paint Living Room",
        description: "Paint the living room walls with the new color",
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: TaskStatus.PENDING,
        homeId: home.id,
      }),
    }
  );

  if (!createHomeTaskResponse.ok) {
    console.error(
      "Failed to create home task:",
      await createHomeTaskResponse.text()
    );
    process.exit(1);
  }

  const homeTask = await createHomeTaskResponse.json();
  console.log("Created home task:", homeTask);

  // Test getting tasks for a home
  const getHomeTasksResponse = await fetch(
    `http://localhost:3000/api/homes/${home.id}/tasks`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getHomeTasksResponse.ok) {
    console.error(
      "Failed to get home tasks:",
      await getHomeTasksResponse.text()
    );
    process.exit(1);
  }

  const homeTasks = await getHomeTasksResponse.json();
  console.log("All home tasks:", homeTasks);

  // Test creating a task for a room
  const createRoomTaskResponse = await fetch(
    `http://localhost:3000/api/rooms/${room.id}/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        title: "Clean Windows",
        description: "Clean all windows in the living room",
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: TaskStatus.PENDING,
        roomId: room.id,
      }),
    }
  );

  if (!createRoomTaskResponse.ok) {
    console.error(
      "Failed to create room task:",
      await createRoomTaskResponse.text()
    );
    process.exit(1);
  }

  const roomTask = await createRoomTaskResponse.json();
  console.log("Created room task:", roomTask);

  // Test getting tasks for a room
  const getRoomTasksResponse = await fetch(
    `http://localhost:3000/api/rooms/${room.id}/tasks`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getRoomTasksResponse.ok) {
    console.error(
      "Failed to get room tasks:",
      await getRoomTasksResponse.text()
    );
    process.exit(1);
  }

  const roomTasks = await getRoomTasksResponse.json();
  console.log("All room tasks:", roomTasks);

  // Test creating a task for an item
  const createItemTaskResponse = await fetch(
    `http://localhost:3000/api/items/${item.id}/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        title: "Clean TV Screen",
        description: "Clean the TV screen with appropriate cleaner",
        priority: TaskPriority.LOW,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: TaskStatus.PENDING,
        itemId: item.id,
      }),
    }
  );

  if (!createItemTaskResponse.ok) {
    console.error(
      "Failed to create item task:",
      await createItemTaskResponse.text()
    );
    process.exit(1);
  }

  const itemTask = await createItemTaskResponse.json();
  console.log("Created item task:", itemTask);

  // Test getting tasks for an item
  const getItemTasksResponse = await fetch(
    `http://localhost:3000/api/items/${item.id}/tasks`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getItemTasksResponse.ok) {
    console.error(
      "Failed to get item tasks:",
      await getItemTasksResponse.text()
    );
    process.exit(1);
  }

  const itemTasks = await getItemTasksResponse.json();
  console.log("All item tasks:", itemTasks);

  // Test updating a task
  const updateTaskResponse = await fetch(
    `http://localhost:3000/api/tasks/${roomTask.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        status: TaskStatus.IN_PROGRESS,
        description: "Clean all windows in the living room thoroughly",
      }),
    }
  );

  if (!updateTaskResponse.ok) {
    console.error("Failed to update task:", await updateTaskResponse.text());
    process.exit(1);
  }

  const updatedTask = await updateTaskResponse.json();
  console.log("Updated task:", updatedTask);

  // Test deleting a task
  const deleteTaskResponse = await fetch(
    `http://localhost:3000/api/tasks/${itemTask.id}`,
    {
      method: "DELETE",
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!deleteTaskResponse.ok) {
    console.error("Failed to delete task:", await deleteTaskResponse.text());
    process.exit(1);
  }

  console.log("Delete task response status:", deleteTaskResponse.status);

  // Test creating a recurring task
  const createRecurringTaskResponse = await fetch(
    `http://localhost:3000/api/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `next-auth.session-token=${token}`,
      },
      body: JSON.stringify({
        title: "Weekly Room Cleaning",
        description: "Regular cleaning of the living room",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: new Date().toISOString(),
        roomId: room.id,
        isRecurring: true,
        interval: 1,
        unit: TaskRecurrenceUnit.WEEKLY,
      }),
    }
  );

  if (!createRecurringTaskResponse.ok) {
    console.error(
      "Failed to create recurring task:",
      await createRecurringTaskResponse.text()
    );
    process.exit(1);
  }

  const recurringTask = await createRecurringTaskResponse.json();
  console.log("Created recurring task:", recurringTask);

  // Test completing a recurring task (should create next occurrence)
  const completeTaskResponse = await fetch(
    `http://localhost:3000/api/tasks/${recurringTask.id}/complete`,
    {
      method: "POST",
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!completeTaskResponse.ok) {
    console.error(
      "Failed to complete task:",
      await completeTaskResponse.text()
    );
    process.exit(1);
  }

  const completedTask = await completeTaskResponse.json();
  console.log("Completed task:", completedTask);

  // Test getting all tasks
  const getAllTasksResponse = await fetch(
    `http://localhost:3000/api/tasks`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

  if (!getAllTasksResponse.ok) {
    console.error(
      "Failed to get all tasks:",
      await getAllTasksResponse.text()
    );
    process.exit(1);
  }

  const allTasks = await getAllTasksResponse.json();
  console.log("All tasks:", allTasks);

  console.log("All tests completed successfully!");
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
}); 