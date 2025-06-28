"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { BarChart, TrendingUp } from "lucide-react";
import { usePets } from "@/hooks/use-pets";
import { HealthTrendsCharts, HealthSummaryCards } from "@/components/health-logs";
import { useState, useEffect } from "react";

export default function AnalyticsPage() {
  const { user, isLoading: userLoading } = useUser();
  const { data: pets, isLoading: petsLoading } = usePets();
  const [selectedPetId, setSelectedPetId] = useState<string>("");

  useEffect(() => {
    if (Array.isArray(pets) && pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  const handlePetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPetId(event.target.value);
  };

  // 獲取選中寵物的名稱
  const selectedPet = Array.isArray(pets) 
    ? pets.find(pet => pet.id === selectedPetId) 
    : null;

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
        <p className="text-muted-foreground">您需要登入才能檢視數據分析</p>
      </div>
    );
  }

  if (!petsLoading && (!pets || pets.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart className="h-8 w-8" />
              數據分析
            </h1>
            <p className="text-muted-foreground">
              深入了解寵物的健康趨勢和行為模式
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">還沒有寵物資料</h3>
          <p className="text-muted-foreground mb-4">
            請先新增寵物並記錄健康日誌，才能進行數據分析
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart className="h-8 w-8" />
            數據分析
          </h1>
          <p className="text-muted-foreground">
            深入了解 {selectedPet?.name || "寵物"} 的健康趨勢和行為模式
          </p>
        </div>
      </div>

      {/* 寵物選擇器 */}
      {Array.isArray(pets) && pets.length > 0 && (
        <div className="max-w-xs">
          <label
            htmlFor="pet-select"
            className="block text-sm font-medium mb-1"
          >
            選擇寵物
          </label>
          <select
            id="pet-select"
            value={selectedPetId}
            onChange={handlePetChange}
            className="block w-full border border-input rounded-md px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          >
            {!selectedPetId && (
              <option value="" disabled>
                請選擇寵物
              </option>
            )}
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 內容區域 */}
      {selectedPetId && (
        <div className="space-y-6">
          {/* 健康指標摘要 */}
          <HealthSummaryCards petName={selectedPet?.name} />
          
          {/* 健康趨勢圖表 */}
          <HealthTrendsCharts petName={selectedPet?.name} />
          
          {/* 額外的分析資訊 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              📊 數據洞察
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h4 className="font-medium mb-1">健康評估</h4>
                <p>基於過去 30 天的數據，{selectedPet?.name} 的整體健康狀況良好，各項指標都在正常範圍內。</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">建議關注</h4>
                <p>建議持續記錄體重變化，特別關注食慾和活動量的相關性，有助於早期發現健康問題。</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}