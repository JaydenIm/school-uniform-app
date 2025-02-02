import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 현재 경로
  const path = request.nextUrl.pathname

  // 루트 경로도 보호된 경로에 포함
  const isProtectedRoute = path === '/' || path.startsWith('/dashboard')
  
  // 로그인이 불필요한 경로들
  const isPublicRoute = path === '/auth/login'

  // localStorage는 미들웨어에서 접근할 수 없으므로 쿠키를 사용
  const authToken = request.cookies.get('user')?.value

  // 인증이 필요한 페이지에 접근하려 할 때
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // 이미 로그인된 상태에서 로그인 페이지에 접근하려 할 때
  if (isPublicRoute && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: ['/', '/dashboard/:path*', '/auth/login']
} 