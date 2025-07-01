"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@auth0/nextjs-auth0"
import { 
  Heart, 
  PawPrint, 
  Calendar, 
  FileText, 
  Settings, 
  Home,
  BarChart3,
  Upload,
  Share2,
  LogOut,
  User
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { navigation } from "@/components/navigation/navigation"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const { user } = useUser()

  // Close sidebar when route changes
  React.useEffect(() => {
    onClose()
  }, [pathname, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-background border-r border-border transform transition-transform lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-14 items-center border-b border-border px-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">P</span>
              </div>
              <span className="font-bold">PetLog</span>
            </Link>
          </div>

          {/* User Info */}
          {user && (
            <div className="border-b border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || "用戶頭像"}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
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
          </nav>

          {/* Footer */}
          {user && (
            <div className="border-t border-border p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                asChild
              >
                <Link href="/api/auth/logout">
                  <LogOut className="mr-3 h-4 w-4" />
                  登出
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}