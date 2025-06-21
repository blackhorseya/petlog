"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { PawPrint, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PetsPage() {
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
        <p className="text-muted-foreground">您需要登入才能管理寵物</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">我的寵物</h1>
          <p className="text-muted-foreground">
            管理您的寵物檔案和基本資訊
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新增寵物
        </Button>
      </div>

      {/* Empty state */}
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <PawPrint className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">還沒有寵物</h3>
        <p className="text-muted-foreground mb-4">
          開始新增您的第一隻寵物，建立專屬的健康檔案
        </p>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新增寵物
        </Button>
      </div>
    </div>
  );
}