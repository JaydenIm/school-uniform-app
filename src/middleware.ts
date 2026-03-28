import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  const isProtectedRoute = path === '/' ||
                          path.startsWith('/profile') ||
                          path.startsWith('/schools')

  const isPublicRoute = path === '/login' ||
                       path === '/signup'

  // 1. 비로그인 사용자가 보호된 경로에 접근할 경우
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. 로그인된 사용자가 로그인/회원가입 페이지에 접근할 경우 대시보드로 리다이렉트
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 3. 역할별 권한 제어 (RBAC)
  if (token) {
    const role = token.role as string

    // 학생(STUDENT) 권한 사용자는 치수 입력 페이지만 접근 가능
    if (role === 'STUDENT') {
      const isMeasurementPage = path.startsWith('/measure/')
      if (!isMeasurementPage) {
        // 학생용 대시보드가 있다면 그곳으로, 없다면 안내 페이지로 이동
        // 여기서는 임시로 로그아웃 처리하거나 제한된 페이지만 허용
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // 파트너(PARTNER) 권한 사용자는 일반적인 대시보드 및 학교 관리 가능
    // 만약 나중에 어드민 전용 페이지(/admin)가 생긴다면 여기서 제한
    if (role === 'PARTNER') {
      if (path.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
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