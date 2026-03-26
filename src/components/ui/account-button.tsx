'use client';

import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import { UserCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function AccountButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string; image: string | null } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile({ name: data.name, image: data.image });
        }
      } catch (err) {
        console.error('AccountButton fetch error:', err);
      }
    };
    if (session) fetchProfile();
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 px-3 py-6 text-white hover:bg-white/10 hover:text-white border-none rounded-xl"
        >
          {profile?.image ? (
            <img 
              src={profile.image} 
              alt="Profile" 
              className="h-8 w-8 rounded-full object-cover border border-white/20" 
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
              <UserCircle className="h-5 w-5 text-white/70" />
            </div>
          )}
          <div className="flex flex-col items-start overflow-hidden">
            <span className="text-sm font-bold truncate w-full text-left">{profile?.name || session?.user?.name || '사용자'}</span>
            <span className="text-[11px] text-white/50 truncate w-full text-left">{session?.user?.email}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="w-56 ml-2 bg-white rounded-xl shadow-xl border-none p-1">
        <DropdownMenuItem 
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-purple-50 text-gray-700 font-medium"
        >
          <UserCircle className="h-4 w-4 text-purple-600" />
          내 정보 관리
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-red-50 text-red-600 font-medium mt-1"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}