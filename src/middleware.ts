import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // If user is on signin page and has valid token, redirect to dashboard
  if (pathname === '/signin') {
    const token = request.cookies.get('auth-token')?.value
    if (token) {
      const user = await verifyToken(token)
      if (user) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
    // If no token or invalid token, allow access to signin page
    return NextResponse.next()
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    '/signup',
    '/api/auth/login',
    '/api/auth/logout',
    '/_next',
    '/favicon.ico'
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to signin if no token
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Verify the token
  const user = await verifyToken(token)

  if (!user) {
    // Redirect to signin if token is invalid
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Add user info to headers for use in components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', user.id)
  requestHeaders.set('x-user-email', user.email)
  requestHeaders.set('x-user-name', user.name)
  requestHeaders.set('x-user-role', user.role)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
