import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // refreshing the auth token
    const { data: { user } } = await supabase.auth.getUser();

    // SELF-HEALING FIX: Intercept "code" on homepage and redirect to callback
    // This handles cases where Supabase Redirect URL is misconfigured to "/"
    const url = request.nextUrl.clone();
    if (url.pathname === "/" && url.searchParams.has("code")) {
        const code = url.searchParams.get("code");
        const next = url.searchParams.get("next") || "/";

        // Construct the correct callback URL
        const callbackUrl = new URL("/auth/callback", request.url);
        callbackUrl.searchParams.set("code", code!);
        callbackUrl.searchParams.set("next", next);

        console.log("Middleware: Intercepting auth code on homepage, redirecting to callback");
        return NextResponse.redirect(callbackUrl);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
