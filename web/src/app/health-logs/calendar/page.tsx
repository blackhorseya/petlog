"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from "@auth0/nextjs-auth0";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Filter, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { usePets } from '@/hooks/use-pets';
import { useHealthLogs } from '@/hooks/use-health-logs';
import HealthLogCalendar from '@/components/health-logs/health-log-calendar';
import HealthLogModal from '@/components/health-logs/health-log-modal';
import { HealthLog } from '@/lib/types/health-log';

interface HealthLogEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: HealthLog;
  type: 'weight' | 'food' | 'behavior' | 'litter' | 'general';
}

export default function HealthLogCalendarPage() {
  const { user, isLoading: userLoading } = useUser();
  const { data: pets, isLoading: petsLoading } = usePets();
  
  // 狀態管理
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingLog, setEditingLog] = useState<HealthLog | undefined>();
  const [filters, setFilters] = useState({
    weight: true,
    food: true,
    behavior: true,
    litter: true,
    general: true,
  });

  // 計算日期範圍（當前月份前後一個月）
  const startDate = React.useMemo(() => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 10);
  }, [currentDate]);

  const endDate = React.useMemo(() => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().slice(0, 10);
  }, [currentDate]);

  // 載入健康記錄資料
  const {
    data: healthLogsData,
    isLoading: logsLoading,
    error: logsError,
  } = useHealthLogs({ 
    petId: selectedPetId,
    startDate,
    endDate,
  });

  // 自動選擇第一隻寵物
  useEffect(() => {
    if (Array.isArray(pets) && pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  // 處理寵物切換
  const handlePetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPetId(event.target.value);
  };

  // 處理日曆事件點擊
  const handleSelectEvent = (event: HealthLogEvent) => {
    setEditingLog(event.resource);
    setSelectedDate(undefined);
    setShowModal(true);
  };

  // 處理日曆日期點擊
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setEditingLog(undefined);
    setSelectedDate(slotInfo.start);
    setShowModal(true);
  };

  // 處理日曆導航
  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  // 關閉模態框
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDate(undefined);
    setEditingLog(undefined);
  };

  // 切換過濾器
  const toggleFilter = (filterType: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  // 根據過濾器篩選健康記錄
  const filteredHealthLogs = React.useMemo(() => {
    if (!healthLogsData?.health_logs) return [];
    
    return healthLogsData.health_logs.filter(log => {
      // 檢查是否有對應類型的資料，並且該類型的過濾器是開啟的
      if (log.weight_kg && log.weight_kg > 0 && filters.weight) return true;
      if (log.food_gram && log.food_gram > 0 && filters.food) return true;
      if (log.behaviour_notes && filters.behavior) return true;
      if (log.litter_notes && filters.litter) return true;
      if (!log.weight_kg && !log.food_gram && !log.behaviour_notes && !log.litter_notes && filters.general) return true;
      
      return false;
    });
  }, [healthLogsData?.health_logs, filters]);

  // 載入狀態
  if (userLoading || petsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // 沒有寵物的情況
  if (!pets || pets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/health">
              <ArrowLeft className="h-4 w-4 mr-2" />
              回到健康記錄
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">沒有寵物資料</h3>
              <p className="text-muted-foreground mb-4">請先新增寵物，然後再查看健康記錄日曆。</p>
              <Button asChild>
                <Link href="/pets">新增寵物</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題和導航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/health">
              <ArrowLeft className="h-4 w-4 mr-2" />
              回到健康記錄
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">健康記錄日曆</h1>
            <p className="text-muted-foreground">以日曆形式檢視和管理寵物健康記錄</p>
          </div>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 寵物選擇 */}
        <Card className="lg:w-80">
          <CardHeader>
            <CardTitle className="text-lg">控制面板</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 寵物選擇器 */}
            <div>
              <label htmlFor="pet-select" className="block text-sm font-medium mb-2">
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
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 過濾器 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">記錄類型過濾</span>
              </div>
              <div className="space-y-2">
                {[
                  { key: 'weight', label: '體重', color: 'bg-green-500' },
                  { key: 'food', label: '飲食', color: 'bg-amber-500' },
                  { key: 'behavior', label: '行為', color: 'bg-blue-500' },
                  { key: 'litter', label: '排泄', color: 'bg-purple-500' },
                  { key: 'general', label: '一般記錄', color: 'bg-gray-500' },
                ].map(({ key, label, color }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters[key as keyof typeof filters]}
                      onChange={() => toggleFilter(key as keyof typeof filters)}
                      className="rounded"
                    />
                    <div className={`h-3 w-3 rounded ${color}`}></div>
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 統計資訊 */}
            {selectedPetId && (
              <div>
                <h4 className="text-sm font-medium mb-2">本月統計</h4>
                <div className="text-sm text-muted-foreground">
                  <p>總記錄數: {filteredHealthLogs.length}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 日曆主體 */}
        <div className="flex-1">
          {logsLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex h-64 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              </CardContent>
            </Card>
          ) : logsError ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-destructive">載入健康記錄失敗：{logsError.message}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <HealthLogCalendar
              healthLogs={filteredHealthLogs}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              onNavigate={handleNavigate}
            />
          )}
        </div>
      </div>

      {/* 健康記錄模態框 */}
      <HealthLogModal
        isOpen={showModal}
        onClose={handleCloseModal}
        selectedDate={selectedDate}
        editingLog={editingLog}
        petId={selectedPetId}
      />
    </div>
  );
}