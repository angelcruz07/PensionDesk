import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Comprobación optimista por cookie. La sesión real se valida en
 * `app/(dashboard)/layout.tsx` con `auth.api.getSession`.
 */
export default function proxy(request: NextRequest) {
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
