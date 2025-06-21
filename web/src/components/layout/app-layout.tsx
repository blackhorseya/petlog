"use client"

import * as React from "react"
import { useUser } from "@auth0/nextjs-auth0"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/navigation/sidebar"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { MobileSidebar } from "@/components/navigation/mobile-sidebar"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const { user } = useUser()

  const handleSidebarToggle = React.useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const handleSidebarClose = React.useCallback(() => {
    setSidebarOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onMenuToggle={handleSidebarToggle} 
        isMenuOpen={sidebarOpen}
      />

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Desktop Sidebar */}
        {user && (
          <aside className="hidden w-64 flex-col border-r border-border bg-background lg:flex">
            <Sidebar />
          </aside>
        )}

        {/* Mobile Sidebar */}
        <MobileSidebar 
          isOpen={sidebarOpen} 
          onClose={handleSidebarClose} 
        />

        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 overflow-auto",
            // Add bottom padding on mobile to account for bottom navigation
            "pb-16 lg:pb-0"
          )}
        >
          <div className="container mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {user && <MobileNav />}
    </div>
  )
}