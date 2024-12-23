import { createHome, getUserHomes } from "@/lib/home.utils";
import { requireAuth } from "@/lib/session";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const json = await request.json();
    const home = await createHome(user.id, json);
    
    return NextResponse.json(home, { status: 201 });
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

export async function GET() {
  try {
    const user = await requireAuth();
    const homes = await getUserHomes(user.id);
    
    return NextResponse.json(homes);
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