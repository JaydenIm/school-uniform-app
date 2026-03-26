'use client';

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { LeftMenu } from "../../components/ui/left-menu";
import { AccountButton } from "../../components/ui/account-button";

const inter = Inter({ subsets: ["latin"] });

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className={`flex min-h-screen ${inter.className}`}>
        <LeftMenu />
        <div className="flex-1 ml-64 flex flex-col">
          {/* 상단 헤더 */}
          <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
            <div className="flex justify-between items-center px-6 h-16">
              {/* 페이지 브레드크럼 영역 (여백) */}
              <div />
              {/* AccountButton moved to LeftMenu */}
            </div>
          </header>
          <main className="flex-1 p-6 bg-gray-50">
            {children}
          </main>
        </div>
        <Toaster richColors position="top-right" />
      </div>
    </SessionProvider>
  )
}