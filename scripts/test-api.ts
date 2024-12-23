import { getTestUserToken } from "../src/lib/test.utils";

async function main() {
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

  const home = await createHomeResponse.json();
  console.log("Created home:", home);

  // Test getting homes
  const getHomesResponse = await fetch("http://localhost:3000/api/homes", {
    headers: {
      Cookie: `next-auth.session-token=${token}`,
    },
  });

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
        description: "The main living area"
      }),
    }
  );

  const room = await createRoomResponse.json();
  console.log("Created room:", room);

  // Test getting rooms for a home
  const getRoomsResponse = await fetch(
    `http://localhost:3000/api/homes/${home.id}/rooms`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

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
        description: "Updated main living area"
      }),
    }
  );

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
        warrantyUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        manualUrl: "https://www.lg.com/manual.pdf",
      }),
    }
  );

  const item = await createItemResponse.json();
  console.log("Created item:", item);

  // Test getting items for a room
  const getItemsResponse = await fetch(
    `http://localhost:3000/api/rooms/${room.id}/items`,
    {
      headers: {
        Cookie: `next-auth.session-token=${token}`,
      },
    }
  );

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
        name: "Main Floor Hardwood",
        type: "Hardwood",
        material: "Oak",
        brand: "Bruce",
        color: "Natural",
        pattern: "Traditional Strip",
        notes: "3/4 inch solid hardwood",
      }),
    }
  );

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
        name: "Living Room Carpet",
        type: "Carpet",
        material: "Nylon",
        brand: "Shaw",
        color: "Pewter",
        pattern: "Textured Loop",
        notes: "Stain-resistant treatment applied",
      }),
    }
  );

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
        priority: "HIGH",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    }
  );

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
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    }
  );

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
        priority: "LOW",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    }
  );

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
        status: "IN_PROGRESS",
        description: "Clean all windows in the living room thoroughly",
      }),
    }
  );

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

  console.log("Delete task response status:", deleteTaskResponse.status);
}

main().catch(console.error); 