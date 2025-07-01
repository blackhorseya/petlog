"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "./category-badge";

export interface ChartData {
  trendData: {
    date: string;
    amount: number;
  }[];
  categoryData: {
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
}

interface ExpenseChartsProps {
  data: ChartData;
  loading?: boolean;
}

export function ExpenseCharts({ data, loading = false }: ExpenseChartsProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 簡化版趨勢圖（使用CSS實現基本效果）
  const maxAmount = Math.max(...data.trendData.map(d => d.amount));
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 支出趨勢圖 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">支出趨勢</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 簡化的趨勢顯示 */}
            <div className="space-y-2">
              {data.trendData.slice(-7).map((item, index) => (
                <div key={item.date} className="flex items-center space-x-3">
                  <div className="text-xs text-muted-foreground w-16">
                    {new Date(item.date).toLocaleDateString('zh-TW', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex-1 flex items-center space-x-2">
                    <div 
                      className="h-2 bg-primary rounded-full"
                      style={{ 
                        width: `${(item.amount / maxAmount) * 100}%`,
                        minWidth: '4px'
                      }}
                    />
                    <div className="text-sm font-medium">
                      {formatAmount(item.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              過去 7 日支出趨勢
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分類佔比圖 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">分類佔比</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 簡化的圓餅圖效果 */}
            <div className="relative w-48 h-48 mx-auto">
              <div className="w-full h-full rounded-full border-8 border-muted relative overflow-hidden">
                {data.categoryData.map((item, index) => {
                  const previousPercentage = data.categoryData
                    .slice(0, index)
                    .reduce((sum, cat) => sum + cat.percentage, 0);
                  
                  return (
                    <div
                      key={item.category}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(from ${previousPercentage * 3.6}deg, ${item.color} ${previousPercentage * 3.6}deg ${(previousPercentage + item.percentage) * 3.6}deg, transparent ${(previousPercentage + item.percentage) * 3.6}deg)`,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* 圖例 */}
            <div className="space-y-2">
              {data.categoryData.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <CategoryBadge category={item.category} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatAmount(item.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 預設顏色配置
export const getCategoryColor = (category: string) => {
  switch (category) {
    case "醫療":
    case "medical":
      return "#ef4444"; // red-500
    case "飼料":
    case "food":
      return "#22c55e"; // green-500
    case "保健品":
    case "supplement":
      return "#3b82f6"; // blue-500
    case "日用品":
    case "daily":
      return "#a855f7"; // purple-500
    case "其他":
    case "other":
      return "#6b7280"; // gray-500
    default:
      return "#f97316"; // orange-500
  }
};