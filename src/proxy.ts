import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/redis";
import { auth } from "@/auth";

const protectedRoutes = ["/dashboard", "/quiz", "/progress", "/rewards"];
const guestRoutes = ["/auth/login", "/auth/register"];

export default async function proxy(req: NextRequest) {
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

  // --- API Route Rate Limiting ---
  if (pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    
    // Retrieve session for userId-based rate limiting on authenticated routes
    const session = await auth();
    const userId = session?.user?.id;
    const identifier = userId ? `user:${userId}` : `ip:${ip}`;

    let limit = 100;
    const windowSeconds = 600; // 10 minutes
    let keySuffix = "general";

    if (pathname === "/api/auth/register") {
      limit = 5;
      keySuffix = "register";
    } else if (pathname === "/api/user/upgrade") {
      limit = 5;
      keySuffix = "upgrade";
    } else if (pathname === "/api/dashboard/quiz" && req.method === "POST") {
      limit = 30;
      keySuffix = "quiz-submit";
    }

    const rateLimitKey = `rate-limit:${identifier}:${keySuffix}`;
    const result = await rateLimit(rateLimitKey, limit, windowSeconds);

    if (!result.success) {
      console.warn(
        `[SECURITY WARN] Rate limit exceeded. Identifier: ${identifier}, Route: ${pathname}, Method: ${req.method}`
      );
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};