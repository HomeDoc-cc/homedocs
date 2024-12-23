import { createTask, getTasksByRoom } from "@/lib/task.utils";
import { requireAuth } from "@/lib/session";
import { NextResponse } from "next/server";
import { z } from "zod";

interface RouteContext {
  params: {
    roomId: string;
  };
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const json = await request.json();
    const task = await createTask(user.id, { ...json, roomId: context.params.roomId });
    
    return NextResponse.json(task, { status: 201 });
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
    const tasks = await getTasksByRoom(context.params.roomId, user.id);
    
    return NextResponse.json(tasks);
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