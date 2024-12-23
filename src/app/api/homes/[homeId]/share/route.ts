import { shareHome } from "@/lib/home.utils";
import { requireAuth } from "@/lib/session";
import { NextResponse } from "next/server";
import { z } from "zod";

const shareSchema = z.object({
  email: z.string().email(),
  role: z.enum(["READ", "WRITE"]),
});

interface RouteContext {
  params: {
    homeId: string;
  };
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const json = await request.json();
    const { email, role } = shareSchema.parse(json);
    
    const share = await shareHome(context.params.homeId, user.id, email, role);
    
    return NextResponse.json(share, { status: 201 });
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