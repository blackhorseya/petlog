"use client";

import { useState, useCallback, useMemo } from 'react';
import { Plus, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExpenseCard, ExpenseFilters, ExpensePagination } from '@/components/expenses';
import { useExpenses, useExpenseManagement } from '@/hooks/use-expenses';
import type { ExpenseFilters as ExpenseFiltersType, Expense } from '@/lib/types/expense';

interface ExpenseListProps {
  onAddExpense?: () => void;
  onEditExpense?: (expense: Expense) => void;
}

export function ExpenseList({
  onAddExpense,
  onEditExpense,
}: ExpenseListProps) {
  // 篩選狀態
  const [filters, setFilters] = useState<ExpenseFiltersType>({
    page: 1,
    page_size: 20,
  });

  // 獲取費用資料
  const {
    data: expenseData,
    isLoading,
    error,
    refetch,
  } = useExpenses(filters);

  // 費用管理操作
  const { delete: deleteExpense, isDeleting } = useExpenseManagement();

  // 處理篩選變更
  const handleFiltersChange = useCallback((newFilters: ExpenseFiltersType) => {
    setFilters(newFilters);
  }, []);

  // 重置篩選
  const handleResetFilters = useCallback(() => {
    setFilters({
      page: 1,
      page_size: filters.page_size,
    });
  }, [filters.page_size]);

  // 處理分頁變更
  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  // 處理每頁尺寸變更
  const handlePageSizeChange = useCallback((pageSize: number) => {
    setFilters(prev => ({ 
      ...prev, 
      page_size: pageSize, 
      page: 1 // 重置到第一頁
    }));
  }, []);

  // 處理刪除費用
  const handleDeleteExpense = useCallback(async (expenseId: string) => {
    if (window.confirm('確定要刪除這筆費用紀錄嗎？')) {
      try {
        await deleteExpense(expenseId);
                 // 如果當前頁面沒有資料了，回到上一頁
         if (expenseData && expenseData.expenses.length === 1 && (filters.page || 1) > 1) {
           handlePageChange((filters.page || 1) - 1);
         } else {
           refetch();
         }
      } catch (error) {
        console.error('刪除費用紀錄失敗:', error);
      }
    }
  }, [deleteExpense, expenseData, filters.page, handlePageChange, refetch]);

  // 檢查是否有篩選條件
  const hasFilters = useMemo(() => {
    return Boolean(
      filters.pet_id || 
      filters.category || 
      filters.start_date || 
      filters.end_date || 
      filters.keyword
    );
  }, [filters]);

  // 載入狀態
  if (isLoading && !expenseData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">費用紀錄</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            新增費用
          </Button>
        </div>
        
        {/* 載入骨架 */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">費用紀錄</h1>
          <Button onClick={onAddExpense}>
            <Plus className="h-4 w-4 mr-2" />
            新增費用
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            載入費用紀錄失敗：{error.message}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-4"
            >
              重試
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const expenses = expenseData?.expenses || [];
  const total = expenseData?.total || 0;
  const totalPages = expenseData?.total_pages || 1;

  return (
    <div className="space-y-6">
      {/* 頁面標題和操作 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">費用紀錄</h1>
          <p className="text-muted-foreground">
            管理您的寵物費用紀錄
            {total > 0 && (
              <span className="ml-2">
                {hasFilters ? `篩選出 ${total} 筆` : `共 ${total} 筆`}
              </span>
            )}
          </p>
        </div>
        
        <Button onClick={onAddExpense}>
          <Plus className="h-4 w-4 mr-2" />
          新增費用
        </Button>
      </div>

      {/* 篩選組件 */}
      <ExpenseFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        isLoading={isLoading}
      />

      {/* 費用列表 */}
      <div className="space-y-4">
        {expenses.length === 0 ? (
          // 空狀態
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasFilters ? '沒有符合條件的費用紀錄' : '還沒有費用紀錄'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {hasFilters 
                ? '請嘗試調整篩選條件或清除篩選來查看更多紀錄。'
                : '開始記錄您的寵物費用，讓您更好地了解寵物開支。'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {hasFilters && (
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                >
                  清除篩選
                </Button>
              )}
              <Button onClick={onAddExpense}>
                <Plus className="h-4 w-4 mr-2" />
                新增第一筆費用
              </Button>
            </div>
          </div>
        ) : (
          // 費用卡片列表
          <div className="grid gap-4">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={onEditExpense}
                onDelete={handleDeleteExpense}
                loading={isDeleting}
              />
            ))}
          </div>
        )}
      </div>

      {/* 分頁組件 */}
      {expenses.length > 0 && (
        <ExpensePagination
          currentPage={filters.page || 1}
          totalPages={totalPages}
          totalItems={total}
          pageSize={filters.page_size || 20}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
        />
      )}

      {/* 載入中覆蓋層 */}
      {isLoading && expenseData && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>正在載入...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}