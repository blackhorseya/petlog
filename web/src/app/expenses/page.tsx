"use client";

import { useState, useEffect, useMemo } from 'react';
// import { useUser } from "@auth0/nextjs-auth0"; // Disabled for mock
import { DollarSign, TrendingUp, Filter, MoreHorizontal, PieChart, BarChart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ExpenseCharts, 
  SummaryPanel,
  type ChartData, 
  type ExpenseSummary,
  getCategoryColor 
} from '@/components/expenses';
// import { usePets } from "@/hooks/use-pets"; // Disabled for mock
// import { useExpenses, useExpenseStatistics } from "@/hooks/use-expenses"; // Disabled for mock
import type { ExpenseWithPetName } from '@/lib/api/expense';
import Link from 'next/link';

// --- Mock Data ---
const mockPets = [
  { id: 'pet1', name: '小虎', owner_id: 'user1', created_at: new Date().toISOString() },
  { id: 'pet2', name: '花花', owner_id: 'user1', created_at: new Date().toISOString() },
  { id: 'pet3', name: '球球', owner_id: 'user1', created_at: new Date().toISOString() },
];

const mockExpenses: ExpenseWithPetName[] = [
  // --- July ---
  { id: 'exp1', pet_id: 'pet1', date: '2024-07-10', category: '醫療', amount: 1200, description: '年度疫苗', created_at: new Date().toISOString(), pet_name: '小虎', updated_at: new Date().toISOString() },
  { id: 'exp2', pet_id: 'pet1', date: '2024-07-08', category: '飼料', amount: 2500, description: '皇家貓糧', created_at: new Date().toISOString(), pet_name: '小虎', updated_at: new Date().toISOString() },
  { id: 'exp3', pet_id: 'pet2', date: '2024-07-05', category: '玩具', amount: 350, description: '逗貓棒', created_at: new Date().toISOString(), pet_name: '花花', updated_at: new Date().toISOString() },
  // --- June ---
  { id: 'exp4', pet_id: 'pet1', date: '2024-06-28', category: '保健品', amount: 800, description: '關節保健', created_at: new Date().toISOString(), pet_name: '小虎', updated_at: new Date().toISOString() },
  { id: 'exp5', pet_id: 'pet3', date: '2024-06-25', category: '美容', amount: 1500, description: '洗澡剪毛', created_at: new Date().toISOString(), pet_name: '球球', updated_at: new Date().toISOString() },
  { id: 'exp6', pet_id: 'pet2', date: '2024-06-22', category: '日用品', amount: 450, description: '貓砂', created_at: new Date().toISOString(), pet_name: '花花', updated_at: new Date().toISOString() },
  // --- May ---
  { id: 'exp7', pet_id: 'pet1', date: '2024-05-20', category: '零食', amount: 600, description: '肉泥', created_at: new Date().toISOString(), pet_name: '小虎', updated_at: new Date().toISOString() },
  { id: 'exp8', pet_id: 'pet3', date: '2024-05-18', category: '醫療', amount: 3000, description: '驅蟲藥', created_at: new Date().toISOString(), pet_name: '球球', updated_at: new Date().toISOString() },
  // --- April ---
  { id: 'exp9', pet_id: 'pet1', date: '2024-04-15', category: '飼料', amount: 2400, description: '皇家貓糧', created_at: new Date().toISOString(), pet_name: '小虎', updated_at: new Date().toISOString() },
  { id: 'exp10', pet_id: 'pet2', date: '2024-04-11', category: '玩具', amount: 200, description: '老鼠玩具', created_at: new Date().toISOString(), pet_name: '花花', updated_at: new Date().toISOString() },
  // --- March ---
  { id: 'exp11', pet_id: 'pet1', date: '2024-03-07', category: '其他', amount: 150, description: '項圈', created_at: new Date().toISOString(), pet_name: '小虎', updated_at: new Date().toISOString() },
  { id: 'exp12', pet_id: 'pet3', date: '2024-03-03', category: '保健品', amount: 950, description: '益生菌', created_at: new Date().toISOString(), pet_name: '球球', updated_at: new Date().toISOString() },
  // --- February ---
  { id: 'exp13', pet_id: 'pet2', date: '2024-02-15', category: '醫療', amount: 1800, description: '健康檢查', created_at: new Date().toISOString(), pet_name: '花花', updated_at: new Date().toISOString() },
];

const mockStatisticsData = {
  total_expense: 6500,
  expense_count: 5,
  category_distribution: [
    { category: '醫療', total: 1200, percentage: 18.46 },
    { category: '食品', total: 800, percentage: 12.31 },
    { category: '玩具', total: 500, percentage: 7.69 },
    { category: '保健品', total: 2500, percentage: 38.46 },
    { category: '美容', total: 1500, percentage: 23.08 },
  ]
};
// --- End Mock Data ---


export default function ExpensesDashboardPage() {
  const [selectedPetId, setSelectedPetId] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  
  // --- Use Mock Data ---
  const user = { name: "Sean Zheng" };
  const pets = mockPets;
  const statisticsData = mockStatisticsData;
  const userLoading = false;
  const petsLoading = false;
  const expensesLoading = false;
  const statisticsLoading = false;
  // --- End Use Mock Data ---

  // 處理寵物按鈕點擊
  const handlePetButtonClick = (petId: string) => {
    setSelectedPetId(petId);
  };

  // 處理舊版 UI 的下拉選單
  const handlePetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPetId(event.target.value);
  };

  const handleTimeRangeChange = (range: 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
  };

  const selectedPet = Array.isArray(pets) && selectedPetId !== "all"
    ? pets.find(pet => pet.id === selectedPetId) 
    : null;

  // --- Derived State and Data Processing ---
  const { summaryData, chartData } = useMemo(() => {
    const filteredByPet = selectedPetId !== 'all'
      ? mockExpenses.filter(e => e.pet_id === selectedPetId) 
      : mockExpenses;
      
    // Find the latest date in the mock data
    const latestDate = mockExpenses.reduce((latest, exp) => new Date(exp.date) > new Date(latest) ? exp.date : latest, '1970-01-01');

    // Filter for the last 6 months
    const sixMonthsAgo = new Date(latestDate);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Go back 5 months to get a total of 6 months
    sixMonthsAgo.setDate(1); // Start from the beginning of that month

    const lastSixMonthsExpenses = filteredByPet.filter(exp => new Date(exp.date) >= sixMonthsAgo);

    // Chart Data: Trend (Last 6 months)
    const trend: { [key: string]: number } = {};
    lastSixMonthsExpenses.forEach(exp => {
      const month = exp.date.substring(0, 7); // "YYYY-MM"
      if (!trend[month]) trend[month] = 0;
      trend[month] += exp.amount;
    });
    
    // Ensure all 6 months are present, even with 0 amount
    for (let i = 0; i < 6; i++) {
      const d = new Date(latestDate);
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!trend[monthKey]) {
        trend[monthKey] = 0;
      }
    }

    const trendData = Object.entries(trend)
      .map(([date, amount]) => ({ date: `${date}-01`, amount })) // Use YYYY-MM-01 for date parsing
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    // Chart Data: Category Breakdown
    const category: { [key: string]: { amount: number, color: string } } = {};
    filteredByPet.forEach(exp => {
      const current = category[exp.category] || { amount: 0, color: getCategoryColor(exp.category) };
      category[exp.category] = {
        amount: current.amount + exp.amount,
        color: getCategoryColor(exp.category)
      };
    });

    const totalCategoryAmount = Object.values(category).reduce((sum, c) => sum + c.amount, 0);
    const categoryData = Object.entries(category).map(([categoryName, { amount, color }]) => ({
      category: categoryName,
      amount,
      percentage: totalCategoryAmount > 0 ? (amount / totalCategoryAmount) * 100 : 0,
      color
    }));
    
    const finalChartData = { trendData, categoryData };

    // Summary Data
    const recentExpenses = filteredByPet
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(exp => ({ 
        id: exp.id, 
        amount: exp.amount, 
        category: exp.category, 
        date: exp.date,
        description: exp.description || ''
      }));

    const categoryBreakdown = Object.entries(category).map(([categoryName, { amount }]) => ({
      category: categoryName,
      amount,
      count: filteredByPet.filter(e => e.category === categoryName).length
    }));

    const totalAmount = filteredByPet.reduce((sum, exp) => sum + exp.amount, 0);

    const mostSpentCategory = categoryBreakdown.length > 0 
      ? categoryBreakdown.reduce((max, cat) => cat.amount > max.amount ? cat : max)
      : { category: 'N/A' };

    const finalSummaryData: ExpenseSummary = {
      totalAmount: totalAmount,
      monthlyAmount: totalAmount, // For mock, using total as monthly
      lastMonthAmount: 7500, // mock
      categoryBreakdown: categoryBreakdown,
      recentExpenses: recentExpenses,
      mostSpentCategory: mostSpentCategory.category,
    };

    return { summaryData: finalSummaryData, chartData: finalChartData };
  }, [selectedPetId]);

  const expensesData = useMemo(() => ({
    expenses: mockExpenses.filter(e => selectedPetId === 'all' || e.pet_id === selectedPetId),
    total: mockExpenses.filter(e => selectedPetId === 'all' || e.pet_id === selectedPetId).length,
    page: 1,
    limit: 10
  }), [selectedPetId]);

  if (userLoading || petsLoading) {
    return <div>讀取中...</div>;
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
              費用總覽儀表板
            </h1>
            <p className="text-muted-foreground">
              以圖表視覺化方式，快速掌握所有寵物的支出狀況
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
    <div className="space-y-8">
      {/* 頁面標題和控制項 */}
      <div>
        <h1 className="text-3xl font-bold tracking-wide">費用總覽儀表板</h1>
        <p className="text-muted-foreground text-lg mt-1">
          以圖表視覺化方式，快速掌握所有寵物的支出狀況
        </p>
      </div>

      {/* 圖表區 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-gray-600">
              <BarChart className="h-5 w-5" />
              支出趨勢
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseCharts data={chartData} loading={expensesLoading} chartType="trend" />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-gray-600">
              <PieChart className="h-5 w-5" />
              分類支出分布
            </CardTitle>
          </CardHeader>
          <CardContent>
             <ExpenseCharts data={chartData} loading={expensesLoading} chartType="category" />
          </CardContent>
        </Card>
      </div>
      
      {/* 摘要區塊 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">本月總支出</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${summaryData.monthlyAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">支出最多分類</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summaryData.mostSpentCategory || 'N/A'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">最近紀錄</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-lg font-semibold">
              {summaryData.recentExpenses[0] ? `${summaryData.recentExpenses[0].date.split('T')[0]}` : ''}
            </div>
            <p className="text-sm text-muted-foreground">
              {summaryData.recentExpenses[0] ? `${summaryData.recentExpenses[0].category} $${summaryData.recentExpenses[0].amount}` : '無紀錄'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 依寵物細分查詢 */}
      <div className="pt-6 border-t border-dashed">
         <h2 className="text-lg font-semibold mb-3">依寵物細分查詢</h2>
         <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handlePetButtonClick('all')}
              variant={selectedPetId === 'all' ? 'default' : 'secondary'}
            >
              所有寵物
            </Button>
           {pets?.map(pet => (
             <Button 
                key={pet.id} 
                variant={selectedPetId === pet.id ? 'default' : 'secondary'}
                onClick={() => handlePetButtonClick(pet.id)}
              >
               {pet.name}
             </Button>
           ))}
            <Button variant="outline" asChild>
              <Link href="/pets/new">
                <Plus className="h-4 w-4 mr-2" />
                新增寵物
              </Link>
            </Button>
         </div>
      </div>

      {/* OLD UI - Kept for reference, can be removed later */}
      <div className="hidden">
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
              chartType="all"
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
                      共 {pets?.length || 0} 隻寵物
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
      </div>

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