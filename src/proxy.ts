import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Redirect recruiters away from candidate dashboard
    if (pathname.startsWith("/candidate") && token?.role !== "candidate") {
      return NextResponse.redirect(new URL("/recruiter/dashboard", req.url));
    }

    // Redirect candidates away from recruiter dashboard
    if (pathname.startsWith("/recruiter") && token?.role !== "recruiter") {
      return NextResponse.redirect(new URL("/candidate/dashboard", req.url));
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
  matcher: ["/recruiter/:path*", "/candidate/:path*"],
};
