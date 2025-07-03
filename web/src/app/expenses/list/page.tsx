"use client";

import { useState } from 'react';
import { useUser } from "@auth0/nextjs-auth0";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpenseList } from '@/components/expenses';
import type { Expense } from '@/lib/types/expense';
import Link from 'next/link';

export default function ExpenseListPage() {
  const { user, isLoading: userLoading } = useUser();
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // 處理新增費用
  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseDialogOpen(true);
  };

  // 處理編輯費用
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseDialogOpen(true);
  };

  // 關閉對話框
  const handleCloseDialog = () => {
    setIsExpenseDialogOpen(false);
    setEditingExpense(null);
  };

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
        <p className="text-muted-foreground">您需要登入才能檢視費用資料</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題和導航 */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/expenses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回總覽
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">費用明細</h1>
            <p className="text-muted-foreground">
              查看和管理所有費用記錄
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href="/expenses/new">
            <Plus className="h-4 w-4 mr-2" />
            新增費用
          </Link>
        </Button>
      </div>

      {/* 費用列表 */}
      <div className="container mx-auto px-0 max-w-6xl">
        <ExpenseList
          onAddExpense={handleAddExpense}
          onEditExpense={handleEditExpense}
        />
      </div>

      {/* TODO: 實作費用表單對話框 */}
      {isExpenseDialogOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg p-6 shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">
              {editingExpense ? '編輯費用紀錄' : '新增費用紀錄'}
            </h2>
            <p className="text-muted-foreground mb-4">
              費用表單功能將在 Task 6 中實作
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}