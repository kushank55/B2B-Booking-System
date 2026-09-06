import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

function homeForRole(role: string | undefined) {
  return role === "SYSTEM_OWNER" ? "/owner" : "/admin";
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/login")) {
    if (!role) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(homeForRole(role), req.nextUrl));
  }

  if (pathname.startsWith("/owner")) {
    if (!role) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (role !== "SYSTEM_OWNER") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!role) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (role !== "BUSINESS_ADMIN") {
      return NextResponse.redirect(new URL("/owner", req.nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/owner/:path*", "/admin/:path*"],
};
