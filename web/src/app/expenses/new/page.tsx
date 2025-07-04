"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { ArrowLeft, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expenses";
import type { CreateExpenseRequest } from "@/lib/types/expense";
import Link from 'next/link';

export default function NewExpensePage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();

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

  const handleCancel = () => {
    router.push('/expenses');
  };

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

      {/* 費用表單 */}
      <ExpenseForm 
        onSuccess={() => router.push('/expenses')}
        onCancel={handleCancel}
      />
    </div>
  );
}