"use client"

import * as React from "react"
import Link from "next/link"
import { useUser } from "@auth0/nextjs-auth0"
import { Menu, X, User, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onMenuToggle?: () => void
  isMenuOpen?: boolean
}

export function Header({ onMenuToggle, isMenuOpen }: HeaderProps) {
  const { user, isLoading } = useUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          onClick={onMenuToggle}
          aria-label={isMenuOpen ? "關閉選單" : "開啟選單"}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Logo */}
        <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">P</span>
          </div>
          <span className="hidden font-bold sm:inline-block">
            PetLog
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 text-sm font-medium lg:flex">
          <Link
            href="/pets"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            我的寵物
          </Link>
          <Link
            href="/health"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            健康記錄
          </Link>
          <Link
            href="/medical"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            醫療記錄
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <div className="flex items-center space-x-2">
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">
                  {user.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
              {/* Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 rounded-full"
                    aria-label="用戶選單"
                  >
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name || "用戶頭像"}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <a
                      href="/auth/logout"
                      className="flex items-center text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      登出
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button asChild>
              <a href="/auth/login">登入</a>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}