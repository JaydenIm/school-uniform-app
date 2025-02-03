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
    <html lang="en">
      <body>
        <SessionProvider>
          {/* 여기서 LeftMenu를 제거하고 children만 렌더링 */}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
