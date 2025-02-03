import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 현재 경로
  const path = request.nextUrl.pathname

  // (main) 그룹의 보호된 경로들
  const isProtectedRoute = path === '/' ||              // 메인 대시보드
                          path.startsWith('/profile') || // 프로필 페이지
                          path.startsWith('/settings')   // 설정 페이지들
  
  // (auth) 그룹의 공개 경로들
  const isPublicRoute = path === '/login' ||  // 로그인 페이지
                       path === '/signup'      // 회원가입 페이지

  // next-auth 세션 쿠키 확인
  const authToken = request.cookies.get('next-auth.session-token')?.value || 
                   request.cookies.get('__Secure-next-auth.session-token')?.value;

  // 인증이 필요한 페이지에 접근하려 할 때
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 이미 로그인된 상태에서 로그인/회원가입 페이지에 접근하려 할 때
  if (isPublicRoute && authToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// 미들웨어가 적용될 경로들
export const config = {
  matcher: [
    '/',                  // 메인 대시보드
    '/login',            // 로그인
    '/signup',           // 회원가입
    '/profile',          // 프로필
    '/settings/:path*'   // 설정 관련 모든 하위 경로
  ]
} 