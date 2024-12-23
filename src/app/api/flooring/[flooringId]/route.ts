import { deleteFlooring, updateFlooring } from "@/lib/flooring.utils";
import { requireAuth } from "@/lib/session";
import { NextResponse } from "next/server";
import { z } from "zod";

interface RouteContext {
  params: {
    flooringId: string;
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const json = await request.json();
    const flooring = await updateFlooring(context.params.flooringId, user.id, json);
    
    return NextResponse.json(flooring);
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
    await deleteFlooring(context.params.flooringId, user.id);
    
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