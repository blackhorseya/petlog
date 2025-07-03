"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { ArrowLeft, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

export default function NewExpensePage() {
  const { user, isLoading: userLoading } = useUser();

  if (userLoading) {
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
        <p className="text-muted-foreground">您需要登入才能新增費用</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題和導航 */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/expenses">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回總覽
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="h-8 w-8" />
            新增費用
          </h1>
          <p className="text-muted-foreground">
            記錄新的寵物費用支出
          </p>
        </div>
      </div>

      {/* 佔位符內容 */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>費用表單</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">功能開發中</h3>
            <p className="text-muted-foreground mb-4">
              費用表單功能將在 Task 6 中實作
            </p>
            <Button variant="outline" asChild>
              <Link href="/expenses">返回費用總覽</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}