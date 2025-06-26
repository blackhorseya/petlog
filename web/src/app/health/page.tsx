"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { Heart, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePets } from "@/hooks/use-pets";
import { useHealthLogs } from "@/hooks/use-health-logs";
import { useState, useEffect } from "react";
import { deleteHealthLog } from "@/lib/api/health-log";
import { useQueryClient } from "@tanstack/react-query";

export default function HealthPage() {
  const { user, isLoading: userLoading } = useUser();
  const { data: pets, isLoading: petsLoading } = usePets();
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (Array.isArray(pets) && pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  const {
    data: healthLogsData,
    isLoading: logsLoading,
    error: logsError,
  } = useHealthLogs({ petId: selectedPetId });

  const handlePetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPetId(event.target.value);
  };

  async function handleDelete(logId: string) {
    if (!window.confirm("確定要刪除此健康日誌嗎？")) return;
    setDeletingId(logId);
    try {
      await deleteHealthLog(logId);
      await queryClient.invalidateQueries({ queryKey: ["health-logs", selectedPetId] });
    } catch (err) {
      alert("刪除失敗，請重試");
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(logId: string) {
    alert(`點擊編輯：${logId}（可擴充為 modal 編輯表單）`);
  }

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
        <p className="text-muted-foreground">您需要登入才能檢視健康記錄</p>
      </div>
    );
  }

  if (!petsLoading && (!pets || pets.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">健康記錄</h1>
            <p className="text-muted-foreground">
              追蹤寵物的體重、飲食、行為等健康指標
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">還沒有寵物</h3>
          <p className="text-muted-foreground mb-4">
            請先新增寵物，才能開始記錄健康狀況
          </p>
          <Button asChild>
            <Link href="/pets">
              <Plus className="mr-2 h-4 w-4" />
              前往寵物管理
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">健康記錄</h1>
          <p className="text-muted-foreground">
            追蹤寵物的體重、飲食、行為等健康指標
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" disabled={!selectedPetId}>
            <Link href="/health-logs/calendar">
              <Calendar className="mr-2 h-4 w-4" />
              日曆檢視
            </Link>
          </Button>
          <Button asChild disabled={!selectedPetId}>
            <Link href="/health/new">
              <Plus className="mr-2 h-4 w-4" />
              新增記錄
            </Link>
          </Button>
        </div>
      </div>

      {Array.isArray(pets) && pets.length > 0 && (
        <div className="max-w-xs">
          <label htmlFor="pet-select" className="block text-sm font-medium mb-1">選擇寵物</label>
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
              <option key={pet.id} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        </div>
      )}

      {logsLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : logsError ? (
        <div className="text-destructive bg-destructive/10 p-4 rounded-md">
          載入健康日誌失敗：{logsError.message}
        </div>
      ) : Array.isArray(healthLogsData?.health_logs) && healthLogsData.health_logs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 border">日期</th>
                <th className="px-4 py-2 border">行為</th>
                <th className="px-4 py-2 border">備註</th>
                <th className="px-4 py-2 border">操作</th>
              </tr>
            </thead>
            <tbody>
              {healthLogsData.health_logs.map(log => (
                <tr key={log.id} className="hover:bg-accent">
                  <td className="px-4 py-2 border">{log.date.slice(0, 10)}</td>
                  <td className="px-4 py-2 border">{log.behaviour_notes || '-'}</td>
                  <td className="px-4 py-2 border">{log.litter_notes || '-'}</td>
                  <td className="px-4 py-2 border text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(log.id)} disabled={deletingId === log.id}>
                      編輯
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(log.id)} disabled={deletingId === log.id}>
                      {deletingId === log.id ? '刪除中...' : '刪除'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">還沒有健康記錄</h3>
          <p className="text-muted-foreground mb-4">
            {selectedPetId ? '開始記錄寵物的日常健康狀況，建立完整的健康歷史' : '請先選擇寵物，然後開始記錄健康狀況'}
          </p>
          <Button asChild disabled={!selectedPetId}>
            <Link href="/health/new">
              <Plus className="mr-2 h-4 w-4" />
              新增記錄
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}