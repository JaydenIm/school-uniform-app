'use client';

import { LeftMenu } from "../../components/ui/left-menu";
import { AccountButton } from "../../components/ui/account-button";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <LeftMenu />
      <div className="flex-1 ml-64">
        <header className="bg-white border-b">
          <div className="flex justify-end items-center px-6 h-16">
            <AccountButton />
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 