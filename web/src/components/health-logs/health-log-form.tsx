"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createHealthLog } from "@/lib/api/health-log";

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toRFC3339(dateStr: string) {
  // 將 yyyy-MM-dd 轉為 yyyy-MM-ddT00:00:00Z
  return new Date(dateStr + "T00:00:00Z").toISOString();
}

const BEHAVIOR_OPTIONS = ['剪指甲', '剃腳毛', '洗耳朵', '其他'];

export default function HealthLogForm({ petId }: { petId: string }) {
  const [date, setDate] = useState(getTodayISO());
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [behavior, setBehavior] = useState('');
  const [customBehavior, setCustomBehavior] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await createHealthLog({
        pet_id: petId,
        date: toRFC3339(date),
        behaviour_notes: behavior === '其他' ? customBehavior : behavior,
      });
      router.push("/health");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          value={behavior}
          onChange={e => setBehavior(e.target.value)}
          required
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
      <Button type="submit" disabled={loading}>
        {loading ? "送出中..." : "送出"}
      </Button>
    </form>
  );
}
