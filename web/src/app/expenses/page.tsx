"use client";

import { useState, useEffect, useMemo } from 'react';
import { useUser } from "@auth0/nextjs-auth0";
import { DollarSign, TrendingUp, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ExpenseCharts, 
  SummaryPanel, 
  type ChartData, 
  type ExpenseSummary,
  getCategoryColor 
} from '@/components/expenses';
import { usePets } from "@/hooks/use-pets";
import { useExpenses, useExpenseStatistics } from "@/hooks/use-expenses";
import type { ExpenseWithPetName } from '@/lib/api/expense';
import Link from 'next/link';

export default function ExpensesDashboardPage() {
  const { user, isLoading: userLoading } = useUser();
  const { data: pets, isLoading: petsLoading } = usePets();
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  // 設定預設選中的寵物
  useEffect(() => {
    if (Array.isArray(pets) && pets.length > 0 && !selectedPetId) {
      setSelectedPetId("all"); // 預設顯示所有寵物
    }
  }, [pets, selectedPetId]);

  // 獲取費用資料
  const expenseFilters = useMemo(() => {
    const filters: any = {};
    if (selectedPetId && selectedPetId !== "all") {
      filters.pet_id = selectedPetId;
    }
    
    // 根據時間範圍設定日期篩選
    const now = new Date();
    if (timeRange === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filters.start_date = startOfMonth.toISOString().split('T')[0];
    } else if (timeRange === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
      filters.start_date = startOfQuarter.toISOString().split('T')[0];
    } else if (timeRange === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      filters.start_date = startOfYear.toISOString().split('T')[0];
    }
    
    return filters;
  }, [selectedPetId, timeRange]);

  const { data: expensesData, isLoading: expensesLoading } = useExpenses(expenseFilters);
  const { data: statisticsData, isLoading: statisticsLoading } = useExpenseStatistics(
    selectedPetId !== "all" ? { pet_id: selectedPetId } : undefined
  );

  // 處理寵物選擇變更
  const handlePetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPetId(event.target.value);
  };

  // 處理時間範圍變更
  const handleTimeRangeChange = (range: 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
  };

  // 獲取選中寵物的名稱
  const selectedPet = Array.isArray(pets) && selectedPetId !== "all"
    ? pets.find(pet => pet.id === selectedPetId) 
    : null;

  // 準備圖表資料
  const chartData: ChartData = useMemo(() => {
    if (!expensesData?.expenses) {
      return { trendData: [], categoryData: [] };
    }

    const expenses = expensesData.expenses;

    // 準備趨勢資料（過去 30 天）
    const trendMap = new Map<string, number>();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    last30Days.forEach(date => trendMap.set(date, 0));

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date).toISOString().split('T')[0];
      if (trendMap.has(expenseDate)) {
        trendMap.set(expenseDate, trendMap.get(expenseDate)! + expense.amount);
      }
    });

    const trendData = Array.from(trendMap.entries()).map(([date, amount]) => ({
      date,
      amount
    }));

    // 準備分類資料
    const categoryMap = new Map<string, number>();
    expenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    const totalAmount = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);
    const categoryData = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
      color: getCategoryColor(category)
    }));

    return { trendData, categoryData };
  }, [expensesData]);

  // 準備摘要資料
  const summaryData: ExpenseSummary = useMemo(() => {
    if (!expensesData?.expenses) {
      return {
        totalAmount: 0,
        monthlyAmount: 0,
        lastMonthAmount: 0,
        categoryBreakdown: [],
        recentExpenses: []
      };
    }

    const expenses = expensesData.expenses;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 計算本月和上月金額
    const thisMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const lastMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
    });

    const monthlyAmount = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const lastMonthAmount = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // 分類統計
    const categoryMap = new Map<string, { amount: number; count: number }>();
    expenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || { amount: 0, count: 0 };
      categoryMap.set(expense.category, {
        amount: current.amount + expense.amount,
        count: current.count + 1
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count
    }));

    // 最近費用
    const recentExpenses = expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(expense => ({
        id: expense.id,
        amount: expense.amount,
        category: expense.category,
        date: expense.date
      }));

    return {
      totalAmount,
      monthlyAmount,
      lastMonthAmount,
      categoryBreakdown,
      recentExpenses
    };
  }, [expensesData]);

  if (userLoading || petsLoading) {
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

  if (!petsLoading && (!pets || pets.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <DollarSign className="h-8 w-8" />
              費用總覽
            </h1>
            <p className="text-muted-foreground">
              管理和分析寵物費用支出
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <DollarSign className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">還沒有寵物資料</h3>
          <p className="text-muted-foreground mb-4">
            請先新增寵物，然後開始記錄費用
          </p>
          <Button asChild>
            <Link href="/pets">新增寵物</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題和控制項 */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="h-8 w-8" />
            費用總覽
          </h1>
          <p className="text-muted-foreground">
            {selectedPet 
              ? `${selectedPet.name} 的費用分析和統計` 
              : "所有寵物的費用分析和統計"
            }
          </p>
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          {/* 寵物選擇器 */}
          {Array.isArray(pets) && pets.length > 0 && (
            <div className="min-w-[160px]">
              <select
                value={selectedPetId}
                onChange={handlePetChange}
                className="block w-full border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm"
              >
                <option value="all">所有寵物</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 時間範圍選擇器 */}
          <div className="flex rounded-md border border-input overflow-hidden">
            {(['month', 'quarter', 'year'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTimeRangeChange(range)}
                className="rounded-none border-0"
              >
                {range === 'month' ? '本月' : range === 'quarter' ? '本季' : '本年'}
              </Button>
            ))}
          </div>

          {/* 功能按鈕 */}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/expenses/list">
                <Filter className="h-4 w-4 mr-2" />
                明細查詢
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/expenses/new">新增費用</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 載入狀態 */}
      {(expensesLoading || statisticsLoading) && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      )}

      {/* Dashboard 內容 */}
      {!expensesLoading && !statisticsLoading && (
        <div className="space-y-6">
          {/* 摘要面板 */}
          <SummaryPanel 
            summary={summaryData}
            loading={expensesLoading}
          />

          {/* 圖表區域 */}
          <ExpenseCharts 
            data={chartData}
            loading={expensesLoading}
          />

          {/* 快速操作卡片 */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href="/expenses/list" className="block">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">明細查詢</CardTitle>
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {expensesData?.total || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    查看所有費用記錄
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href="/expenses/categories" className="block">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">分類管理</CardTitle>
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {chartData.categoryData.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    管理費用分類
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <Link href="/expenses/reports" className="block">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">費用報告</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {timeRange === 'month' ? '月報' : timeRange === 'quarter' ? '季報' : '年報'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    生成詳細報告
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      )}

      {/* 空狀態 */}
      {!expensesLoading && !statisticsLoading && (!expensesData?.expenses || expensesData.expenses.length === 0) && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <DollarSign className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">還沒有費用記錄</h3>
          <p className="text-muted-foreground mb-4">
            開始記錄 {selectedPet ? selectedPet.name : "寵物"} 的費用支出吧
          </p>
          <Button asChild>
            <Link href="/expenses/new">新增第一筆費用</Link>
          </Button>
        </div>
      )}
    </div>
  );
}