import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Simple in-memory rate limiter for Edge Runtime
// Note: This is per-instance and will reset on redeploys/instance cold starts
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT = 100 // max 100 requests
const WINDOW_MS = 60 * 1000 // per 1 minute

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 0. Simple Rate Limiting
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()
    const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now }

    if (now - rateData.lastReset > WINDOW_MS) {
        rateData.count = 1
        rateData.lastReset = now
    } else {
        rateData.count++
    }

    rateLimitMap.set(ip, rateData)

    if (rateData.count > RATE_LIMIT) {
        console.warn(`[RateLimit] Blocked IP: ${ip} (${rateData.count} requests in window)`)
        return new NextResponse("Too Many Requests", { status: 429 })
    }

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

    // This will refresh session if expired - essential for Next.js SSR
    const { data: { user } } = await supabase.auth.getUser()

    const url = new URL(request.url)

    // 1. Protected Admin Routes
    if (url.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Role check for admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 2. Protected Seller Routes
    if (url.pathname.startsWith('/seller')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Role check for seller
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'seller' && profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
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
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
