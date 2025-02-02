'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function LeftMenu() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="w-64 bg-black text-white p-6 fixed h-full">
      <button
        onClick={() => router.push('/dashboard')}
        className="text-xl font-bold mb-8 hover:text-gray-300"
      >
        School Uniform
      </button>
      <div className="space-y-4">
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