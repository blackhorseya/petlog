"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Weight, Apple, Activity, Heart } from "lucide-react";

interface HealthMetrics {
  currentWeight: number;
  weightChange: number;
  avgFoodIntake: number;
  foodChange: number;
  activityLevel: number;
  activityChange: number;
  totalRecords: number;
}

interface HealthSummaryCardsProps {
  petName?: string;
}

// 生成假的健康指標數據
const generateMockMetrics = (): HealthMetrics => ({
  currentWeight: 5.5,
  weightChange: 0.2, // 正數表示增加，負數表示減少
  avgFoodIntake: 118,
  foodChange: -5, // 相比上週
  activityLevel: 7.2,
  activityChange: 0.3,
  totalRecords: 30,
});

const TrendIcon = ({ change }: { change: number }) => {
  if (change > 0) {
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  } else if (change < 0) {
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  } else {
    return <Minus className="h-4 w-4 text-gray-400" />;
  }
};

const formatChange = (change: number, unit: string) => {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}${unit}`;
};

export function HealthSummaryCards({ petName = "您的寵物" }: HealthSummaryCardsProps) {
  const metrics = generateMockMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 體重卡片 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Weight className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">目前體重</p>
              <p className="text-2xl font-bold">{metrics.currentWeight} kg</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <TrendIcon change={metrics.weightChange} />
            <span className={`text-sm font-medium ${
              metrics.weightChange > 0 ? 'text-green-600' : 
              metrics.weightChange < 0 ? 'text-red-600' : 'text-gray-400'
            }`}>
              {formatChange(metrics.weightChange, ' kg')}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">與上週比較</p>
      </Card>

      {/* 食物攝取卡片 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Apple className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">平均食量</p>
              <p className="text-2xl font-bold">{metrics.avgFoodIntake} g</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <TrendIcon change={metrics.foodChange} />
            <span className={`text-sm font-medium ${
              metrics.foodChange > 0 ? 'text-green-600' : 
              metrics.foodChange < 0 ? 'text-red-600' : 'text-gray-400'
            }`}>
              {formatChange(metrics.foodChange, ' g')}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">與上週比較</p>
      </Card>

      {/* 活動量卡片 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">活動量評分</p>
              <p className="text-2xl font-bold">{metrics.activityLevel}/10</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <TrendIcon change={metrics.activityChange} />
            <span className={`text-sm font-medium ${
              metrics.activityChange > 0 ? 'text-green-600' : 
              metrics.activityChange < 0 ? 'text-red-600' : 'text-gray-400'
            }`}>
              {formatChange(metrics.activityChange, '')}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">與上週比較</p>
      </Card>

      {/* 記錄統計卡片 */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Heart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">健康記錄</p>
              <p className="text-2xl font-bold">{metrics.totalRecords}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">過去 30 天</p>
      </Card>
    </div>
  );
}