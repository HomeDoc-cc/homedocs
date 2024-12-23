import { deleteRoom, getRoomById, updateRoom } from "@/lib/room.utils";
import { requireAuth } from "@/lib/session";
import { NextResponse } from "next/server";
import { z } from "zod";

interface RouteContext {
  params: {
    roomId: string;
  };
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const room = await getRoomById(context.params.roomId, user.id);
    
    return NextResponse.json(room);
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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const json = await request.json();
    const room = await updateRoom(context.params.roomId, user.id, json);
    
    return NextResponse.json(room);
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

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    await deleteRoom(context.params.roomId, user.id);
    
    return new NextResponse(null, { status: 204 });
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