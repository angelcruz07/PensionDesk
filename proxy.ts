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
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSessionCookie = Boolean(getSessionCookie(request));

  if (!hasSessionCookie) {
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
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
  ],
};
