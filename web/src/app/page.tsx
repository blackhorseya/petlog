"use client";

import { useUser } from "@auth0/nextjs-auth0";
import Link from "next/link";
import { Heart, PawPrint, Calendar, FileText, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const features = [
  {
    name: "寵物管理",
    description: "建立和管理您的寵物檔案，記錄基本資訊和照片",
    icon: PawPrint,
    href: "/pets",
  },
  {
    name: "健康記錄",
    description: "追蹤體重、飲食、行為等日常健康指標",
    icon: Heart,
    href: "/health",
  },
  {
    name: "日曆檢視",
    description: "以日曆方式檢視所有健康記錄和醫療行程",
    icon: Calendar,
    href: "/calendar",
  },
  {
    name: "醫療記錄",
    description: "管理疫苗接種、體檢報告和醫療文件",
    icon: FileText,
    href: "/medical",
  },
];

export default function Home() {
  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">載入時發生錯誤</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          PetLog
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          專業的寵物健康管理系統，讓您輕鬆追蹤愛寵的健康狀況
        </p>
        
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name || "用戶頭像"}
                  className="h-12 w-12 rounded-full"
                />
              )}
              <div className="text-left">
                <p className="text-lg font-medium">歡迎回來，{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button asChild size="lg">
              <Link href="/pets">
                開始管理寵物
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <Button asChild size="lg">
            <Link href="/api/auth/login">
              開始使用
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      {/* Features Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.name}
              className="relative group overflow-hidden rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.name}</h3>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {feature.description}
              </p>
              {user && (
                <Link
                  href={feature.href}
                  className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <span className="sr-only">前往 {feature.name}</span>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats or additional info for logged in users */}
      {user && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold mb-4">快速概覽</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">寵物數量</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">健康記錄</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <p className="text-sm text-muted-foreground">醫療記錄</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
