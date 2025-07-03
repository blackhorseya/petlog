"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "./category-badge";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

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
  chartType: 'trend' | 'category' | 'all';
}

export function ExpenseCharts({ data, loading = false, chartType = 'all' }: ExpenseChartsProps) {
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

  let TrendChart = null;

  if (chartType === 'all' || chartType === 'trend') {
    TrendChart = (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.trendData}>
            <XAxis 
              dataKey="date" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => new Date(value).toLocaleDateString('zh-TW', { month: 'short' })}
            />
            <YAxis 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value: number) => [formatAmount(value), "支出"]}
              labelFormatter={(label) => new Date(label).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
              cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }}
            />
            <Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const CategoryChart = (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data.categoryData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
          nameKey="category"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
            if (percent === undefined || percent === 0) return null;
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x  = cx + radius * Math.cos(-(midAngle || 0) * RADIAN);
            const y = cy  + radius * Math.sin(-(midAngle || 0) * RADIAN);
            return (
              <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${((percent || 0) * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {data.categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string) => [formatAmount(value), name]}/>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  if (chartType === 'trend') {
    return TrendChart;
  }

  if (chartType === 'category') {
    return CategoryChart;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 支出趨勢圖 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">支出趨勢</CardTitle>
        </CardHeader>
        <CardContent>
          {TrendChart}
        </CardContent>
      </Card>

      {/* 分類佔比圖 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">分類佔比</CardTitle>
        </CardHeader>
        <CardContent>
          {CategoryChart}
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