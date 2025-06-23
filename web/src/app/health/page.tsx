"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { Heart, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HealthPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">請先登入</h1>
        <p className="text-muted-foreground">您需要登入才能檢視健康記錄</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">健康記錄</h1>
          <p className="text-muted-foreground">
            追蹤寵物的體重、飲食、行為等健康指標
          </p>
        </div>
        <Button asChild>
          <Link href="/health/new">
            <Plus className="mr-2 h-4 w-4" />
            新增記錄
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Heart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">還沒有健康記錄</h3>
        <p className="text-muted-foreground mb-4">
          開始記錄寵物的日常健康狀況，建立完整的健康歷史
        </p>
        <Button asChild>
          <Link href="/health/new">
            <Plus className="mr-2 h-4 w-4" />
            新增記錄
          </Link>
        </Button>
      </div>
    </div>
  );
}