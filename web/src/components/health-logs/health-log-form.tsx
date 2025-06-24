"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createHealthLog } from "@/lib/api/health-log";
import { usePets } from "@/hooks/use-pets";
import { useQueryClient } from '@tanstack/react-query';

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toRFC3339(dateStr: string) {
  // 將 yyyy-MM-dd 轉為 yyyy-MM-ddT00:00:00Z
  return new Date(dateStr + "T00:00:00Z").toISOString();
}

const BEHAVIOR_OPTIONS = ['剪指甲', '剃腳毛', '洗耳朵', '其他'];

export default function HealthLogForm() {
  const { data: pets, isLoading } = usePets();
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [date, setDate] = useState(getTodayISO());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const [behavior, setBehavior] = useState("");
  const [customBehavior, setCustomBehavior] = useState("");
  const queryClient = useQueryClient();

  // 預設選第一隻寵物 - 修正依賴陣列
  useEffect(() => {
    if (pets && pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId]);

  // 自動清空自訂行為欄位
  useEffect(() => {
    if (behavior !== "其他") {
      setCustomBehavior("");
    }
  }, [behavior]);

  // 計算送出按鈕是否應該被禁用
  const isSubmitDisabled = 
    loading ||
    !selectedPetId ||
    !pets ||
    pets.length === 0 ||
    !behavior ||
    (behavior === '其他' && !customBehavior.trim());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await createHealthLog({
        pet_id: selectedPetId,
        date: toRFC3339(date),
        behaviour_notes: behavior === '其他' ? customBehavior.trim() : behavior,
      });
      await queryClient.invalidateQueries({ queryKey: ['health-logs'] });
      router.push("/health");
    } catch (err) {
      setError(err instanceof Error ? err.message : '建立健康日誌失敗，請重試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold mb-2">新增健康日誌</h2>
      
      {/* 錯誤提示 */}
      {error && (
        <div className="text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}
      
      {/* 寵物選擇欄位 */}
      <div>
        <Label htmlFor="pet">寵物 <span className="text-destructive">*</span></Label>
        {isLoading ? (
          <div className="text-muted-foreground">載入中...</div>
        ) : pets && pets.length > 0 ? (
          <select
            id="pet"
            value={selectedPetId}
            onChange={e => setSelectedPetId(e.target.value)}
            required
            className="block w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        ) : (
          <div className="text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
            尚未建立任何寵物，請先新增寵物！
          </div>
        )}
      </div>
      
      <div>
        <Label htmlFor="date">日期 <span className="text-destructive">*</span></Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      
      <div>
        <Label htmlFor="behavior">行為 <span className="text-destructive">*</span></Label>
        <select
          id="behavior"
          value={behavior}
          onChange={e => setBehavior(e.target.value)}
          required
          className="block w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">請選擇行為</option>
          {BEHAVIOR_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        
        {behavior === '其他' && (
          <div className="mt-2">
            <Input
              value={customBehavior}
              onChange={e => setCustomBehavior(e.target.value)}
              placeholder="請輸入其他行為"
              required
              className="focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        )}
      </div>
      
      <Button 
        type="submit" 
        disabled={isSubmitDisabled}
        className="w-full"
      >
        {loading ? "送出中..." : "送出"}
      </Button>
      
      {/* 提示文字 */}
      <p className="text-sm text-muted-foreground">
        <span className="text-destructive">*</span> 為必填欄位
      </p>
    </form>
  );
}
