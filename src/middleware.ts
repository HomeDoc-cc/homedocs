import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // Protected routes
    "/homes/:path*",
    "/api/homes/:path*",
    "/api/rooms/:path*",
    "/api/items/:path*",
    "/api/tasks/:path*",
    // Exclude auth routes
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
}; 