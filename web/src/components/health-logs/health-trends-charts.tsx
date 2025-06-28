"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Weight, Apple, Activity } from "lucide-react";

// 假資料介面定義
interface HealthTrendData {
  date: string;
  weight: number;
  food: number;
  activity: number;
  activityScaled: number; // 為圖表顯示而縮放的活動量
}

// 生成假資料
const generateMockData = (): HealthTrendData[] => {
  const data: HealthTrendData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // 模擬體重趨勢（略有波動的增長）
    const baseWeight = 5.2;
    const weightTrend = (29 - i) * 0.01; // 緩慢增長
    const weightVariation = (Math.random() - 0.5) * 0.3; // 隨機波動
    const weight = baseWeight + weightTrend + weightVariation;
    
    // 模擬食物攝取量（有週期性變化）
    const baseFoodGram = 120;
    const foodVariation = Math.sin((29 - i) / 7) * 20 + (Math.random() - 0.5) * 30;
    const food = Math.max(80, baseFoodGram + foodVariation);
    
    // 模擬活動量評分（1-10）
    const baseActivity = 7;
    const activityVariation = (Math.random() - 0.5) * 4;
    const activity = Math.max(1, Math.min(10, baseActivity + activityVariation));
    
    data.push({
      date: date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
      weight: parseFloat(weight.toFixed(2)),
      food: Math.round(food),
      activity: parseFloat(activity.toFixed(1)),
      activityScaled: parseFloat((activity * 10).toFixed(1)), // 放大10倍
    });
  }
  
  return data;
};

type ChartType = 'weight' | 'food' | 'activity' | 'overview';

interface HealthTrendsChartsProps {
  petName?: string;
}

export function HealthTrendsCharts({ petName = "您的寵物" }: HealthTrendsChartsProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('overview');
  const [mockData] = useState<HealthTrendData[]>(() => generateMockData());

  const renderWeightChart = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Weight className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">體重趨勢</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
            label={{ value: '體重 (公斤)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} kg`, '體重']}
            labelFormatter={(label) => `日期: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-sm text-gray-600">
        <p>💡 體重呈現緩慢上升趨勢，這對於幼年寵物來說是正常的成長模式</p>
      </div>
    </div>
  );

  const renderFoodChart = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Apple className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">食物攝取量</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            label={{ value: '攝取量 (公克)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} g`, '食物攝取量']}
            labelFormatter={(label) => `日期: ${label}`}
          />
          <Bar 
            dataKey="food" 
            fill="#16a34a"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-sm text-gray-600">
        <p>💡 食物攝取量平均約為 120 公克，有週期性變化是正常現象</p>
      </div>
    </div>
  );

  const renderActivityChart = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold">活動量評分</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            domain={[0, 10]}
            label={{ value: '活動量評分 (1-10)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} 分`, '活動量評分']}
            labelFormatter={(label) => `日期: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="activity" 
            stroke="#9333ea" 
            fill="#9333ea"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="text-sm text-gray-600">
        <p>💡 活動量評分平均為 7 分，表示寵物的活動量處於良好水準</p>
      </div>
    </div>
  );

  const renderOverviewChart = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold">健康指標綜合趨勢</h3>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="weight"
            orientation="left"
            label={{ value: '體重 (kg)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="food"
            orientation="right"
            label={{ value: '食物 (g) / 活動量', angle: 90, position: 'insideRight' }}
          />
          <Tooltip 
            formatter={(value: number, name: string, props: any) => {
              if (name === 'weight') return [`${value} kg`, '體重'];
              if (name === 'food') return [`${value} g`, '食物攝取量'];
              if (name === 'activityScaled') {
                // 活動量被放大了10倍以適應食物軸，這裡要還原顯示
                const originalValue = (value / 10).toFixed(1);
                return [`${originalValue} 分`, '活動量評分'];
              }
              return [value, name];
            }}
            labelFormatter={(label) => `日期: ${label}`}
          />
          <Legend 
            formatter={(value) => {
              if (value === 'activityScaled') return '活動量評分';
              return value;
            }}
          />
          <Line 
            yAxisId="weight"
            type="monotone" 
            dataKey="weight" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="體重"
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
          />
          <Line 
            yAxisId="food"
            type="monotone" 
            dataKey="food" 
            stroke="#16a34a" 
            strokeWidth={2}
            name="食物攝取量"
            dot={{ fill: '#16a34a', strokeWidth: 2, r: 3 }}
          />
          <Line 
            yAxisId="food"
            type="monotone" 
            dataKey="activityScaled"
            stroke="#9333ea" 
            strokeWidth={2}
            name="activityScaled"
            dot={{ fill: '#9333ea', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Weight className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">體重趨勢</span>
          </div>
          <p className="text-sm text-blue-600">穩定成長，健康正常</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Apple className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800">進食狀況</span>
          </div>
          <p className="text-sm text-green-600">食慾良好，攝取充足</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-purple-800">活動量</span>
          </div>
          <p className="text-sm text-purple-600">活動適中，精神良好</p>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">健康趨勢分析</h2>
          <p className="text-gray-600">
            {petName} 的健康指標趨勢圖表 - 過去 30 天的數據分析
          </p>
          <p className="text-sm text-orange-600 mt-2">
            ⚠️ 目前顯示的是模擬數據，實際數據將來自健康日誌記錄
          </p>
        </div>

        {/* 圖表類型選擇器 */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeChart === 'overview' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChart('overview')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            綜合趨勢
          </Button>
          <Button
            variant={activeChart === 'weight' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChart('weight')}
            className="flex items-center gap-2"
          >
            <Weight className="h-4 w-4" />
            體重趨勢
          </Button>
          <Button
            variant={activeChart === 'food' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChart('food')}
            className="flex items-center gap-2"
          >
            <Apple className="h-4 w-4" />
            食物攝取
          </Button>
          <Button
            variant={activeChart === 'activity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveChart('activity')}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            活動量
          </Button>
        </div>

        {/* 圖表內容 */}
        <div className="min-h-[400px]">
          {activeChart === 'overview' && renderOverviewChart()}
          {activeChart === 'weight' && renderWeightChart()}
          {activeChart === 'food' && renderFoodChart()}
          {activeChart === 'activity' && renderActivityChart()}
        </div>

        {/* 數據摘要 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">數據摘要（過去 30 天）</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">平均體重:</span>
              <span className="ml-2 font-medium">
                {(mockData.reduce((sum, item) => sum + item.weight, 0) / mockData.length).toFixed(2)} kg
              </span>
            </div>
            <div>
              <span className="text-gray-600">平均食量:</span>
              <span className="ml-2 font-medium">
                {Math.round(mockData.reduce((sum, item) => sum + item.food, 0) / mockData.length)} g
              </span>
            </div>
            <div>
              <span className="text-gray-600">平均活動量:</span>
              <span className="ml-2 font-medium">
                {(mockData.reduce((sum, item) => sum + item.activity, 0) / mockData.length).toFixed(1)} 分
              </span>
            </div>
            <div>
              <span className="text-gray-600">記錄天數:</span>
              <span className="ml-2 font-medium">{mockData.length} 天</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}