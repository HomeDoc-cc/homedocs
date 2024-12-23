import { deletePaint, updatePaint } from "@/lib/paint.utils";
import { requireAuth } from "@/lib/session";
import { NextResponse } from "next/server";
import { z } from "zod";

interface RouteContext {
  params: {
    paintId: string;
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const json = await request.json();
    const paint = await updatePaint(context.params.paintId, user.id, json);
    
    return NextResponse.json(paint);
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
    await deletePaint(context.params.paintId, user.id);
    
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