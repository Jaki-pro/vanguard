import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get session token from cookie
  const sessionToken = request.cookies.get('better-auth.session_token')

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup')
  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard')

  // If user has session token and trying to access auth pages, redirect to dashboard
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user doesn't have session token and trying to access protected pages, redirect to login
  if (isProtectedPage && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/signup', '/dashboard/:path*'],
}
