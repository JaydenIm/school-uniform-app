'use client';

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { LeftMenu } from "@/components/ui/left-menu";
import { AccountMenu } from "@/components/ui/account-menu";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <SessionProvider>
          <div className="flex h-screen">
            <LeftMenu />
            <main className="flex-1 ml-64">
              <div className="p-4 border-b flex justify-end">
                <AccountMenu />
              </div>
              <div className="p-6">
                {children}
              </div>
            </main>
          </div>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
