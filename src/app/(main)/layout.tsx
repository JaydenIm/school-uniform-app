'use client';

import { SessionProvider, useSession } from "next-auth/react";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { LeftMenu } from "../../components/ui/left-menu";
import { AccountButton } from "../../components/ui/account-button";

const inter = Inter({ subsets: ["latin"] });

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isStudent = session?.user?.role === 'STUDENT';

  return (
    <div className={`flex min-h-screen ${inter.className}`}>
      {!isStudent && <LeftMenu />}
      <div className={`flex-1 ${!isStudent ? 'ml-64' : ''} flex flex-col`}>
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <LayoutContent>{children}</LayoutContent>
    </SessionProvider>
  )
}