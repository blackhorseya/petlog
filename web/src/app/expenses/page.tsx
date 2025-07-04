"use client";

import { useState, useMemo } from 'react';
import { useUser } from "@auth0/nextjs-auth0";
import { DollarSign, BarChart, Plus, PieChart } from "lucide-react";
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ExpenseCharts, 
  type ChartData,
  getCategoryColor,
  ExpenseList,
} from '@/components/expenses';
import { usePets } from "@/hooks/use-pets";
import { useExpenses, useExpenseSummary, useExpenseManagement } from "@/hooks/use-expenses";
import type { ExpenseSummary, Expense } from '@/lib/types/expense';

export type ExpenseWithPetName = Expense & { pet_name: string };

export default function ExpensesDashboardPage() {
  const [selectedPetId, setSelectedPetId] = useState<string>("all");
  
  const { user, isLoading: userLoading } = useUser();
  const { data: pets, isLoading: petsLoading } = usePets();

  const apiFilters = { pet_id: selectedPetId === 'all' ? undefined : selectedPetId };
  const { data: expensesData, isLoading: expensesLoading, error: expensesError, refetch: refetchExpenses } = useExpenses(apiFilters);
  const { data: summary, isLoading: summaryLoading } = useExpenseSummary(apiFilters);
  const { delete: deleteExpense, isDeleting } = useExpenseManagement();

  const handlePetButtonClick = (petId: string) => {
    setSelectedPetId(petId);
  };
  
  const petNameMap = useMemo(() => {
    if (!pets) return {};
    return pets.reduce((acc: Record<string, string>, pet) => {
      acc[pet.id] = pet.name;
      return acc;
    }, {});
  }, [pets]);

  const expensesWithPetName = useMemo(() => {
    return expensesData?.expenses.map(exp => ({
      ...exp,
      pet_name: petNameMap[exp.pet_id] || '未知寵物',
    })) || [];
  }, [expensesData, petNameMap]);

  const { summaryData, chartData } = useMemo(() => {
    const defaultSummary: ExpenseSummary = {
      total_amount: 0,
      category_stats: {},
      recent: [],
    };
    
    const currentSummary = summary || defaultSummary;
    
    const trendData = expensesWithPetName
      ? Object.entries(
          expensesWithPetName.reduce((acc: Record<string, number>, expense: Expense) => {
            const month = expense.date.substring(0, 7); // YYYY-MM
            acc[month] = (acc[month] || 0) + expense.amount;
            return acc;
          }, {})
        )
          .map(([date, amount]) => ({ date: `${date}-01`, amount }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      : [];
      
    const categoryStats = currentSummary.category_stats || {};
    const total = currentSummary.total_amount || 0;

    const categoryData = Object.entries(categoryStats)
      .map(([category, amount]) => {
        const percentage = total > 0 ? (amount / total) * 100 : 0;
        return {
          category,
          amount,
          percentage,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      summaryData: {
        total: total,
        categoryData,
      },
      chartData: {
        trendData: trendData,
        categoryData: categoryData.map(item => ({...item, color: getCategoryColor(item.category)})),
      }
    };
  }, [summary, expensesWithPetName]);

  const isLoading = userLoading || petsLoading || expensesLoading || summaryLoading;

  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除這筆費用紀錄嗎？')) {
      await deleteExpense(id);
      refetchExpenses();
    }
  };

  if (userLoading) {
    return <div className="p-6">讀取中...</div>;
  }

  if (!user) {
    return (
      <div className="p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">請先登入</h1>
        <p className="text-muted-foreground">您需要登入才能檢視費用資料</p>
      </div>
    );
  }

  if (!petsLoading && (!pets || pets.length === 0)) {
    return (
      <div className="space-y-6 p-6">
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
            <Link href="/pets/new">新增寵物</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* 頁面標題和控制項 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-wide">費用總覽儀表板</h1>
          <p className="text-muted-foreground text-lg mt-1">
            以圖表視覺化方式，快速掌握所有寵物的支出狀況
          </p>
        </div>
        <Button asChild>
          <Link href="/expenses/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            新增費用
          </Link>
        </Button>
      </div>

      {isLoading ? (
         <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
      ) : (
        <>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">總支出</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${summaryData.total.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">支出最多分類</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summaryData.categoryData[0]?.category || 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">最近紀錄</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-lg font-semibold">
                  {expensesWithPetName[0] ? `${new Date(expensesWithPetName[0].date).toLocaleDateString()}` : 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {expensesWithPetName[0] ? `${expensesWithPetName[0].category} $${expensesWithPetName[0].amount}` : '無紀錄'}
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

          <div className="pt-6 border-t border-dashed">
            <h2 className="text-lg font-semibold mb-3">費用明細</h2>
            <ExpenseList 
              expenses={expensesWithPetName}
              isLoading={expensesLoading}
              isDeleting={isDeleting}
              onDelete={handleDelete}
              error={expensesError}
            />
          </div>
        </>
      )}
    </div>
  );
}