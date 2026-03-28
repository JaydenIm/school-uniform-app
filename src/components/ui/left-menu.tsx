'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, School, ChevronRight, UserCircle, Store, Bell, UserPlus } from "lucide-react";
import { AccountButton } from "./account-button";
import { useSession } from "next-auth/react";

const navGroups = [
  {
    label: "비즈니스 현황",
    items: [
      { href: "/", label: "대시보드", icon: LayoutDashboard, roles: ['ADMIN', 'PARTNER'] },
      { href: "/schools", label: "측정 현황 및 발송", icon: School, roles: ['ADMIN', 'PARTNER'] },
      { href: "/schools/register", label: "학교/학생 등록", icon: UserPlus, roles: ['ADMIN', 'PARTNER'] },
      { href: "/stores", label: "매장 관리", icon: Store, roles: ['ADMIN', 'PARTNER'] },
    ]
  },
  {
    label: "시스템 관리",
    items: [
      { href: "/notices", label: "전체공지 관리", icon: Bell, roles: ['ADMIN'] },
      { href: "/partners", label: "파트너 관리", icon: UserCircle, roles: ['ADMIN'] },
    ]
  }
];

export function LeftMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'PARTNER';

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
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, groupIdx) => {
          const filteredItems = group.items.filter(item => 
            !item.roles || item.roles.includes(userRole)
          );
          
          if (filteredItems.length === 0) return null;

          return (
            <div key={groupIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                {group.label}
              </p>
              {filteredItems.map(({ href, label, icon: Icon }) => {
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
            </div>
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