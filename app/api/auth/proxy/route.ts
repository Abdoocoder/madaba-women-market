import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const response = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Ensure this environment variable is set
        {
            cookies: {
                getAll: () => request.headers.get("cookie") ?
                    request.headers.get("cookie")!.split("; ").map(c => {
                        const [name, ...v] = c.split("=");
                        return { name, value: v.join("=") };
                    }) : [],
                setAll: cookies =>
                    cookies.forEach(c =>
                        response.cookies.set(c.name, c.value, c.options)
                    ),
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    return NextResponse.json({ user });
}
