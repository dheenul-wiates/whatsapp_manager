import { NextRequest, NextResponse } from "next/server"

const ADMIN_SESSION_COOKIE = "wbm_admin_session"
const CLIENT_SESSION_COOKIE = "wbm_client_session"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login"
    const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

    if (isLoginPage) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // All other /admin/* routes require session
    if (!adminSession) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
  }

  // ── Client protected routes ────────────────────────────────────────────────
  const protectedClientRoutes = ["/templates", "/settings", "/onboarding"]
  const isProtectedClient = protectedClientRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedClient) {
    const clientSession = request.cookies.get(CLIENT_SESSION_COOKIE)?.value
    if (!clientSession) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // ── Auth pages: redirect logged-in users away ──────────────────────────────
  const authPages = ["/login", "/signup"]
  const isAuthPage = authPages.some((p) => pathname.startsWith(p))

  if (isAuthPage) {
    const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    if (adminSession) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    const clientSession = request.cookies.get(CLIENT_SESSION_COOKIE)?.value
    if (clientSession) {
      return NextResponse.redirect(new URL("/templates", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/templates/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
    "/signup/:path*",
  ],
}
