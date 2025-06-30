"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Heart, 
  PawPrint, 
  Calendar, 
  FileText, 
  Settings, 
  Home,
  BarChart3,
  Upload,
  Share2
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  {
    name: "首頁",
    href: "/",
    icon: Home,
  },
  {
    name: "我的寵物",
    href: "/pets",
    icon: PawPrint,
  },
  {
    name: "健康記錄",
    href: "/health",
    icon: Heart,
  },
  {
    name: "日曆檢視",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "醫療記錄",
    href: "/medical-records",
    icon: FileText,
  },
  {
    name: "數據分析",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "設定",
    href: "/settings",
    icon: Settings,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            PetLog
          </h2>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "w-full flex items-center px-4 py-2 rounded-md transition-colors font-medium gap-2",
                    isActive ? "bg-muted text-foreground" : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}