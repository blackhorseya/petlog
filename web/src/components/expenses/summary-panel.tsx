"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { CategoryBadge } from "./category-badge";

export interface ExpenseSummary {
  totalAmount: number;
  monthlyAmount: number;
  lastMonthAmount: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    count: number;
  }[];
  recentExpenses: {
    id: string;
    amount: number;
    category: string;
    date: string;
  }[];
}

interface SummaryPanelProps {
  summary: ExpenseSummary;
  loading?: boolean;
}

export function SummaryPanel({ summary, loading = false }: SummaryPanelProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMonthlyChange = () => {
    if (summary.lastMonthAmount === 0) return 0;
    return ((summary.monthlyAmount - summary.lastMonthAmount) / summary.lastMonthAmount) * 100;
  };

  const monthlyChange = calculateMonthlyChange();
  const isIncrease = monthlyChange > 0;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 主要統計卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 總支出 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總支出</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(summary.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              累計所有費用
            </p>
          </CardContent>
        </Card>

        {/* 本月支出 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月支出</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(summary.monthlyAmount)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {isIncrease ? (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              )}
              <span className={isIncrease ? "text-red-500" : "text-green-500"}>
                {Math.abs(monthlyChange).toFixed(1)}%
              </span>
              <span className="ml-1">
                較上月{isIncrease ? "增加" : "減少"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 平均每日支出 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">日均支出</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(Math.round(summary.monthlyAmount / new Date().getDate()))}
            </div>
            <p className="text-xs text-muted-foreground">
              本月平均每日
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 分類統計 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">分類統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.categoryBreakdown.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CategoryBadge category={category.category} />
                  <span className="text-sm text-muted-foreground">
                    {category.count} 筆
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatAmount(category.amount)}</div>
                  <div className="text-xs text-muted-foreground">
                    {((category.amount / summary.totalAmount) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 最近費用 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">最近費用</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.recentExpenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CategoryBadge category={expense.category} />
                  <span className="text-sm text-muted-foreground">
                    {new Date(expense.date).toLocaleDateString('zh-TW', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="font-semibold">{formatAmount(expense.amount)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}