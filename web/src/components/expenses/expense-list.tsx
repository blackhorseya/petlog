"use client";

import { Package, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExpenseCard } from '@/components/expenses';
import type { Expense } from '@/lib/types/expense';

// 擴展 Expense 型別，確保 pet_name 存在
export type ExpenseWithPetName = Expense & { pet_name: string };

interface ExpenseListProps {
  expenses: ExpenseWithPetName[];
  isLoading: boolean;
  isDeleting: boolean;
  onEdit?: (expense: ExpenseWithPetName) => void;
  onDelete: (id: string) => void;
  error?: Error | null;
}

export function ExpenseList({
  expenses,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
  error,
}: ExpenseListProps) {

  // 載入狀態
  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          載入費用紀錄失敗：{error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  // 列表為空
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">沒有符合條件的費用紀錄</h3>
        <p className="text-muted-foreground">請嘗試調整上方的篩選條件，或新增一筆費用紀錄。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
          loading={isDeleting}
        />
      ))}
    </div>
  );
}