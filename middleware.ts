import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "smartservice.ga";

function getSubdomain(hostname: string): string | null {
  // Production : *.smartservice.ga
  if (hostname.endsWith(`.${appDomain}`)) {
    return hostname.slice(0, -(appDomain.length + 1));
  }

  // Développement local : *.localhost
  const localhostMatch = hostname.match(/^(.+)\.localhost(:\d+)?$/);
  if (localhostMatch) {
    return localhostMatch[1];
  }

  return null;
}

function isKnownDomain(hostname: string): boolean {
  const bare = hostname.split(":")[0];
  return (
    bare === appDomain ||
    bare.endsWith(`.${appDomain}`) ||
    bare === "localhost" ||
    bare.endsWith(".localhost")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";

  let response = NextResponse.next({
    request: { headers: new Headers(request.headers) },
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Domaine personnalisé (plan Business) — hostname non reconnu
  if (!isKnownDomain(hostname)) {
    const bare = hostname.split(":")[0];
    response.headers.set("x-custom-domain", bare);
    return response;
  }

  const subdomain = getSubdomain(hostname);

  if (subdomain) {
    response.headers.set("x-tenant-slug", subdomain);
  }

  // Routes dashboard (subdomain "app" ou localhost sans subdomain en dev)
  const isDashboard = subdomain === "app" || (!subdomain && hostname.includes("localhost"));

  if (isDashboard) {
    const isAuthRoute = pathname === "/login" || pathname === "/register";

    if (!user && !isAuthRoute) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (user && isAuthRoute) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
