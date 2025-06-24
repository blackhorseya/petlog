"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createHealthLog } from "@/lib/api/health-log";
import { usePets } from "@/hooks/use-pets";

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
  const router = useRouter();
  const [behavior, setBehavior] = useState("");
  const [customBehavior, setCustomBehavior] = useState("");

  // 預設選第一隻寵物
  useEffect(() => {
    if (pets && pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await createHealthLog({
        pet_id: selectedPetId,
        date: toRFC3339(date),
        behaviour_notes: behavior === '其他' ? customBehavior : behavior,
      });
      router.push("/health");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold mb-2">新增健康日誌</h2>
      {/* 寵物選擇欄位 */}
      <div>
        <Label htmlFor="pet">寵物</Label>
        {isLoading ? (
          <div className="text-muted-foreground">載入中...</div>
        ) : pets && pets.length > 0 ? (
          <select
            id="pet"
            value={selectedPetId}
            onChange={e => setSelectedPetId(e.target.value)}
            required
            className="block w-full border rounded px-3 py-2 mt-1"
          >
            {pets.map(pet => (
              <option key={pet.id} value={pet.id}>{pet.name}</option>
            ))}
          </select>
        ) : (
          <div className="text-destructive">尚未建立任何寵物，請先新增寵物！</div>
        )}
      </div>
      <div>
        <Label htmlFor="date">日期</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="behavior">行為</Label>
        <select
          id="behavior"
          value={behavior}
          onChange={e => setBehavior(e.target.value)}
          required
          className="block w-full border rounded px-3 py-2 mt-1"
        >
          <option value="">請選擇行為</option>
          {BEHAVIOR_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {behavior === '其他' && (
          <Input
            value={customBehavior}
            onChange={e => setCustomBehavior(e.target.value)}
            placeholder="請輸入其他行為"
            required
          />
        )}
      </div>
      <Button type="submit" disabled={loading || !selectedPetId || !pets || pets.length === 0}>
        {loading ? "送出中..." : "送出"}
      </Button>
    </form>
  );
}
