"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, FileText, Edit, Trash2 } from "lucide-react";
import { CategoryBadge } from "./category-badge";

export interface Expense {
  id: string;
  pet_id: string;
  pet_name: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expenseId: string) => void;
  loading?: boolean;
}

export function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  loading = false,
}: ExpenseCardProps) {
  // 格式化日期顯示
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 格式化金額顯示
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* 金額顯示 - 主要視覺元素 */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg font-semibold text-foreground">
                  {formatAmount(expense.amount)}
                </span>
                <CategoryBadge category={expense.category} />
              </div>
              <p className="text-sm text-muted-foreground">
                {expense.pet_name}
              </p>
            </div>
          </div>
          
          {/* 操作按鈕 */}
          <div className="flex space-x-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(expense)}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(expense.id)}
                disabled={loading}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 描述 */}
        {expense.description && (
          <div className="flex items-start space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              {expense.description}
            </p>
          </div>
        )}

        {/* 日期 */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">
            {formatDate(expense.date)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}