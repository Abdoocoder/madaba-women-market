import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: DO NOT REMOVE auth.getUser() or the loop will continue
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 1. Self-healing auth redirect (Legacy from proxy.ts, kept for safety)
    if (request.nextUrl.pathname === "/" && request.nextUrl.searchParams.has("code")) {
        const callbackUrl = new URL("/auth/callback", request.url);
        callbackUrl.searchParams.set("code", request.nextUrl.searchParams.get("code")!);
        callbackUrl.searchParams.set("next", request.nextUrl.searchParams.get("next") || "/");
        return NextResponse.redirect(callbackUrl);
    }

    // 2. Protected Routes
    const protectedRoutes = ["/admin", "/seller", "/buyer", "/dashboard"]
    const isProtected = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

    if (isProtected && !user) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("next", request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (svg, png, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
