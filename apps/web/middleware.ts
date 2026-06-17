// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const DASHBOARD_URL = new URL("/dashboard", request.url);
  const LOGIN_URL = new URL("/login", request.url);
  const cookie = request.headers.get("cookie");

  // Middleware runs server-side, so always use internal Django URL
  const USER_STATUS_URL = process.env.NEXT_PUBLIC_USER_STATUS!;

  console.log("🟦 [Next.js Middleware] Request to:", request.nextUrl.pathname);
  console.log("🍪 [Next.js Middleware] Sending cookies:", cookie);

  try {
    const res = await fetch(USER_STATUS_URL, {
      method: "GET",
      credentials: "include",
      headers: cookie ? { Cookie: cookie } : {},
    });

    console.log("📡 [Next.js Middleware] Django response status:", res.status);

    // ✅ بررسی Set-Cookie headers
    console.log("\n🔍 Checking Set-Cookie headers:");

    // روش 1: getSetCookie()
    try {
      const setCookies = res.headers.getSetCookie();
      console.log("   getSetCookie() result:", setCookies);
      console.log("   Length:", setCookies?.length);
    } catch (e) {
      console.log("   getSetCookie() error:", e);
    }

    // روش 2: get('set-cookie')
    const setCookieHeader = res.headers.get("set-cookie");
    console.log("   get('set-cookie'):", setCookieHeader);

    // روش 3: تمام headers
    console.log("\n📋 All response headers:");
    res.headers.forEach((value, key) => {
      console.log(
        `   ${key}: ${value.substring(0, 80)}${value.length > 80 ? "..." : ""}`,
      );
    });

    const isAuthenticated = res.status === 200;
    const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
    const isLogin = request.nextUrl.pathname.startsWith("/login");

    let response: NextResponse;

    if (isAuthenticated && isLogin) {
      console.log("✅ User authenticated, redirecting to dashboard");
      response = NextResponse.redirect(DASHBOARD_URL);
    } else if (!isAuthenticated && isDashboard) {
      console.log("❌ User not authenticated, redirecting to login");
      response = NextResponse.redirect(LOGIN_URL);
    } else {
      response = NextResponse.next();
    }

    // ✅ تلاش برای forward کردن Set-Cookie
    const setCookies = res.headers.getSetCookie?.() || [];

    if (setCookies.length > 0) {
      console.log(
        `\n✅ [Next.js Middleware] Forwarding ${setCookies.length} cookie(s) to browser:`,
      );
      setCookies.forEach((cookie, index) => {
        console.log(`   [${index}] ${cookie.substring(0, 100)}...`);
        response.headers.append("Set-Cookie", cookie);
      });
    } else if (setCookieHeader) {
      console.log("\n✅ [Next.js Middleware] Forwarding Set-Cookie header:");
      console.log(`   ${setCookieHeader.substring(0, 100)}...`);
      response.headers.set("Set-Cookie", setCookieHeader);
    } else {
      console.log("\n⚠️ [Next.js Middleware] No Set-Cookie headers to forward");
    }

    return response;
  } catch (error) {
    console.error("❌ [Next.js Middleware] Error:", error);

    if (request.nextUrl.pathname.startsWith("/login")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(LOGIN_URL);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
