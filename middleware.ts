
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables.");
    return NextResponse.json(
      { error: "Authentication is temporarily unavailable." },
      { status: 500 }
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.warn("Middleware session check failed:", authError.message);
  }

  const pathname = request.nextUrl.pathname;

  // The home page and login page are public.
  if (pathname === "/") {
    return response;
  }

  if (pathname === "/login") {
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  // Public photo-analysis endpoint. It does not access private user data.
  // Rate-limit this endpoint before exposing it to unauthenticated traffic.
  if (pathname === "/api/analyze-food" && request.method === "POST") {
    return response;
  }

  // Other API routes and pages still require authentication.
  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Please log in to use this feature." },
        { status: 401 }
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

