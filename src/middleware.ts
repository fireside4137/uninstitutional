import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/quiz", "/progress", "/rewards"];
const guestRoutes = ["/auth/login", "/auth/register"];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isGuest = guestRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isGuest && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};