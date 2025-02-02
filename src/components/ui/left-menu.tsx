'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LeftMenu() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-black text-white p-6 fixed h-full">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">School Uniform</h2>
        <nav className="space-y-2">
          <Link 
            href="/dashboard" 
            className={`block py-2 px-4 hover:bg-gray-800 rounded ${
              pathname === '/dashboard' ? 'bg-gray-800' : ''
            }`}
          >
            대시보드
          </Link>
          <Link 
            href="/settings/schools" 
            className={`block py-2 px-4 hover:bg-gray-800 rounded ${
              pathname.startsWith('/settings/schools') ? 'bg-gray-800' : ''
            }`}
          >
            학교 관리
          </Link>
        </nav>
      </div>
    </div>
  );
} 