'use client';

import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

export function AccountMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost" 
        className="flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <UserCircle className="h-5 w-5" />
        {session?.user?.name || '사용자'}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => {
              // 프로필 처리
              setIsOpen(false);
            }}
          >
            프로필
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
} 