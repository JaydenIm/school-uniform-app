'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  Home,
  Settings,
  School,
  ShoppingCart,
  Users
} from "lucide-react"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Link from "next/link"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={cn("pb-12 min-h-screen w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">대시보드</h2>
          <div className="space-y-1">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                홈
              </Button>
            </Link>
            <Link href="/users">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                사용자 관리
              </Button>
            </Link>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <div className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    설정
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-8 space-y-1">
                <Link href="/settings/schools">
                  <Button variant="ghost" className="w-full justify-start">
                    <School className="mr-2 h-4 w-4" />
                    학교 등록
                  </Button>
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  )
} 