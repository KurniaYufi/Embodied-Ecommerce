import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ADMIN_PREFIXES = ["/dashboard", "/seller"];
const AUTH_PREFIXES = ["/checkout", "/account", "/settings"];
const GUEST_ONLY = ["/login", "/register"];

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const needsAdmin = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  const needsAuth = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  if ((needsAdmin || needsAuth) && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(url);
  }

  if (needsAdmin && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  if (isLoggedIn && GUEST_ONLY.includes(pathname)) {
    return NextResponse.redirect(new URL(role === "admin" ? "/dashboard" : "/", req.nextUrl.origin));
  }

  if (pathname.startsWith("/settings/security") && !req.cookies.get("pwd_confirmed")) {
    const url = new URL("/confirm-password", req.nextUrl.origin);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/seller/:path*",
    "/checkout/:path*",
    "/account/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
