import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  BarChart2, 
  FileText, 
  Users, 
  ShoppingCart, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useState } from "react"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: string
  }[]
  isCollapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

const iconMap = {
  "dashboard": LayoutDashboard,
  "analytics": BarChart2,
  "reports": FileText,
  "customers": Users,
  "orders": ShoppingCart,
  "settings": Settings,
}

export function SidebarNav({ className, items, isCollapsed, onCollapse, ...props }: SidebarNavProps) {
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon"
        className="absolute -right-4 top-2 z-10 rounded-full bg-background"
        onClick={() => onCollapse(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>
      <nav
        className={cn(
          "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
          className
        )}
        {...props}
      >
        {items.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap]
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center px-2"
              )}
              asChild
            >
              <Link href={item.href}>
                {Icon && <Icon className={cn(
                  "h-4 w-4",
                  !isCollapsed && "mr-2"
                )} />}
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
} 