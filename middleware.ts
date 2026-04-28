// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Admin routes
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Instructor-only routes
    if (
  (pathname.startsWith("/courses/new") && token?.role === "STUDENT") ||
  (pathname.includes("/edit") && token?.role === "STUDENT")
) {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

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
    "/dashboard/:path*",
    "/courses/new/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/api/courses/:path*",
    "/api/enrollments/:path*",
    "/api/lessons/:path*",
    "/api/ai/:path*",
  ],
};
