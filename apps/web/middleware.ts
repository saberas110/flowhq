import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";


export async function middleware(request: NextRequest) {



    const LOGIN_URL = "http://127.0.0.1:8000/api/accounts/auth/google/login";
    const DASHBOARD_URL = new URL("/dashboard", request.url)
    const cookie = request.headers.get("cookie");

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/accounts/userstatus`, {
            method: "GET",
            credentials: "include",
            headers: cookie ? {Cookie: cookie} : {}
            ,
        });
        console.log('status  is :', res.status)

        if (request.url.includes("/dashboard")) {
            if (res.status === 401) {
                return NextResponse.redirect(LOGIN_URL);
            }
            if (res.status === 200) {
                return NextResponse.next()
            }
        }


        if (request.url.includes("/login")) {
              if (res.status === 401) {
                return NextResponse.redirect(LOGIN_URL);
            }
            if (res.status === 200) {
                return NextResponse.redirect(DASHBOARD_URL)
            }

        }


        }catch(err)
        {
            if (err instanceof TypeError){
                    return NextResponse.redirect(LOGIN_URL);
            }

        }





    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};
