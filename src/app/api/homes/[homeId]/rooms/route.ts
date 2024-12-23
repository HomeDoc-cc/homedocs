import { createRoom, getRoomsByHome } from "@/lib/room.utils";
import { requireAuth } from "@/lib/session";
import { NextResponse } from "next/server";
import { z } from "zod";

interface RouteContext {
  params: {
    homeId: string;
  };
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const json = await request.json();
    const room = await createRoom(context.params.homeId, user.id, json);
    
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const rooms = await getRoomsByHome(context.params.homeId, user.id);
    
    return NextResponse.json(rooms);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 