"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Heart, 
  PawPrint, 
  Calendar, 
  FileText, 
  Home
} from "lucide-react"

import { cn } from "@/lib/utils"

const mobileNavigation = [
  {
    name: "首頁",
    href: "/",
    icon: Home,
  },
  {
    name: "寵物",
    href: "/pets",
    icon: PawPrint,
  },
  {
    name: "健康",
    href: "/health",
    icon: Heart,
  },
  {
    name: "日曆",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "醫療",
    href: "/medical-records",
    icon: FileText,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden">
      <div className="grid h-16 max-w-lg grid-cols-5 mx-auto">
        {mobileNavigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 hover:bg-muted",
                isActive && "text-primary"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 mb-1",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} 
              />
              <span 
                className={cn(
                  "text-xs",
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}