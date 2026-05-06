import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Comprobación optimista por cookie. La sesión real se valida en
 * `app/(dashboard)/layout.tsx` con `auth.api.getSession`.
 *
 * En Next.js 16 el archivo debe exportar la función con nombre `proxy` (no solo
 * `default`); de lo contrario el runtime puede dejar de reconocer el adaptador
 * y fallar con "adapterFn is not a function".
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (!hasSessionCookie) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname === "/calculadora" || pathname.startsWith("/calculadora/")) {
    try {
      const accessUrl = new URL("/api/subscription/calculadora-access", request.url);
      const response = await fetch(accessUrl, {
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
      });
      if (response.ok) {
        const result = (await response.json()) as { hasAccess?: boolean; error?: string | null };
        if (!result.hasAccess) {
          const onboardingUrl = new URL("/seleccionar-plan", request.url);
          onboardingUrl.searchParams.set("planRequired", "1");
          onboardingUrl.searchParams.set("error", result.error ?? "no_plan");
          return NextResponse.redirect(onboardingUrl);
        }
      }
    } catch {
      // Fail-open: la protección fuerte se mantiene en la página /calculadora.
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/calculadora",
    "/calculadora/:path*",
    "/clientes",
    "/clientes/:path*",
    "/reportes",
    "/reportes/:path*",
    "/configuracion",
    "/configuracion/:path*",
    "/seleccionar-plan",
    "/seleccionar-plan/:path*",
  ],
};
