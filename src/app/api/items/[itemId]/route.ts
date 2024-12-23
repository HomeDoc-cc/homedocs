import { getItemById } from "@/lib/item.utils";
import { requireAuth } from "@/lib/session";
import { NextResponse } from "next/server";

interface RouteContext {
  params: {
    itemId: string;
  };
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const item = await getItemById(context.params.itemId, user.id);
    
    return NextResponse.json(item);
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