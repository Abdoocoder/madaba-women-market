import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            console.log("✅ Successfully exchanged code for session");
            return NextResponse.redirect(`${origin}${next}`);
        } else {
            console.error("❌ Error exchanging code for session:", error);
            // Append error info to redirect for debugging
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}&error_code=${error.code || 'unknown'}`);
        }
    }

    // return the user to an error page with instructions
    console.warn("⚠️ No code found in auth callback");
    return NextResponse.redirect(`${origin}/login?error=Authentication Failed`);
}
