'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, School, ChevronRight, UserCircle, Store } from "lucide-react";
import { AccountButton } from "./account-button";

const navItems = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/schools", label: "측정 현황 및 발송", icon: School },
  { href: "/schools/register", label: "학교/학생 등록", icon: ChevronRight },
  { href: "/stores", label: "매장 관리", icon: Store },
];

export function LeftMenu() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="w-64 fixed h-full flex flex-col" style={{ background: '#4B0082' }}>
      {/* 로고 영역 */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center px-6 py-5 border-b border-white/10 hover:bg-white/5 transition-colors"
      >
        <div className="brand-logo text-2xl text-white tracking-tight">
          <span className="brand-on font-light">On</span><span className="brand-fit font-extrabold">Fit</span>
        </div>
        <div className="ml-2 text-[10px] text-white/50 font-medium mt-1">온핏</div>
      </button>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-white/20 text-white shadow-inner'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* 하단 사용자 정보 및 로그아웃 */}
      <div className="px-3 py-4 border-t border-white/10">
        <AccountButton />
      </div>

      {/* 하단 버전 뱃지 */}
      <div className="px-6 py-2">
        <span className="text-[10px] text-white/30 font-mono">v1.0.0-beta</span>
      </div>
    </div>
  );
}