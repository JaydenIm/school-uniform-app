import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isProtectedRoute = path === '/' ||
                          path.startsWith('/profile') ||
                          path.startsWith('/schools')

  const isPublicRoute = path === '/login' ||
                       path === '/signup'

  const authToken = request.cookies.get('next-auth.session-token')?.value ||
                   request.cookies.get('__Secure-next-auth.session-token')?.value;

  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublicRoute && authToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/profile',
    '/schools/:path*',
  ]
}