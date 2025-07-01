"use client";

import { useState } from 'react';
import { ExpenseList } from '@/components/expenses';
import type { Expense } from '@/lib/types/expense';

export default function ExpensesPage() {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ExpenseList
        onAddExpense={handleAddExpense}
        onEditExpense={handleEditExpense}
      />

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