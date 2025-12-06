import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const DASHBOARD_URL = new URL("/dashboard", request.url);
  const Login_Url = new URL("/login", request.url)
  const cookie = request.headers.get("cookie");

  try {
    const res = await fetch(process.env["USER_STATUS_URL"], {
      method: "GET",
      credentials: "include",
      headers: cookie ? { Cookie: cookie } : {},
    });
    if (res.status === 200) {
      if (request.nextUrl.pathname.startsWith("/dashboard"))
        return NextResponse.next();
      else if (request.nextUrl.pathname.startsWith("/login"))
        return NextResponse.redirect(DASHBOARD_URL);
    }
    if (res.status === 401)
      {
      if (request.nextUrl.pathname.startsWith("/dashboard"))
        return NextResponse.redirect(Login_Url);
      else if (request.nextUrl.pathname.startsWith("/login"))
        return NextResponse.next();
    }
  } catch (error) {
    if (error instanceof TypeError) {
      console.log("error in cach middleware ", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
