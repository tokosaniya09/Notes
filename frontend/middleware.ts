import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/login")
  
  // 1. Redirect authenticated users away from login page
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 2. Protect dashboard routes
  const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard")
  if (isDashboardPage && !isLoggedIn) {
    let callbackUrl = req.nextUrl.pathname
    if (req.nextUrl.search) {
      callbackUrl += req.nextUrl.search
    }
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url)
    )
  }

  return NextResponse.next()
})

// Configure matcher to run middleware on specific paths
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
