"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HealthLog, CreateHealthLogRequest } from "@/lib/types/health-log";
import { createHealthLog, updateHealthLog } from "@/lib/api/health-log";
import { usePets } from "@/hooks/use-pets";
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

interface HealthLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  editingLog?: HealthLog;
  petId?: string;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function HealthLogModal({
  isOpen,
  onClose,
  selectedDate,
  editingLog,
  petId: initialPetId,
}: HealthLogModalProps) {
  const { data: pets, isLoading: petsLoading } = usePets();
  const queryClient = useQueryClient();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 表單狀態
  const [selectedPetId, setSelectedPetId] = useState<string>(initialPetId || '');
  const [date, setDate] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [foodGram, setFoodGram] = useState<string>('');
  const [litterNotes, setLitterNotes] = useState<string>('');
  const [behaviourNotes, setBehaviourNotes] = useState<string>('');

  // 當模態框打開時初始化表單
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);
      
      if (editingLog) {
        // 編輯模式 - 載入現有資料
        setSelectedPetId(editingLog.pet_id);
        setDate(editingLog.date.slice(0, 10));
        setWeightKg(editingLog.weight_kg?.toString() || '');
        setFoodGram(editingLog.food_gram?.toString() || '');
        setLitterNotes(editingLog.litter_notes || '');
        setBehaviourNotes(editingLog.behaviour_notes || '');
      } else {
        // 新建模式 - 重置表單
        setSelectedPetId(initialPetId || (pets?.[0]?.id || ''));
        setDate(selectedDate ? formatDateForInput(selectedDate) : formatDateForInput(new Date()));
        setWeightKg('');
        setFoodGram('');
        setLitterNotes('');
        setBehaviourNotes('');
      }
    }
  }, [isOpen, editingLog, selectedDate, initialPetId, pets]);

  // 當 pets 載入完成且沒有選擇寵物時，自動選擇第一隻寵物
  useEffect(() => {
    if (isOpen && !selectedPetId && pets && pets.length > 0) {
      setSelectedPetId(pets[0].id);
    }
  }, [isOpen, selectedPetId, pets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!selectedPetId) {
        throw new Error('請選擇寵物');
      }

      if (!date) {
        throw new Error('請選擇日期');
      }

      const healthLogData: CreateHealthLogRequest = {
        pet_id: selectedPetId,
        date: date,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        food_gram: foodGram ? parseInt(foodGram, 10) : undefined,
        litter_notes: litterNotes.trim() || undefined,
        behaviour_notes: behaviourNotes.trim() || undefined,
      };

      if (editingLog) {
        // 更新現有記錄
        await updateHealthLog(editingLog.id, healthLogData);
      } else {
        // 建立新記錄
        await createHealthLog(healthLogData);
      }

      // 重新整理資料
      await queryClient.invalidateQueries({ queryKey: ['health-logs'] });
      
      // 關閉模態框
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {editingLog ? '編輯健康記錄' : '新增健康記錄'}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 錯誤提示 */}
          {error && (
            <div className="text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          {/* 寵物選擇 */}
          <div>
            <Label htmlFor="pet">寵物 <span className="text-destructive">*</span></Label>
            {petsLoading ? (
              <div className="text-muted-foreground">載入中...</div>
            ) : pets && pets.length > 0 ? (
              <select
                id="pet"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                required
                disabled={isSubmitting}
                className="block w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">請選擇寵物</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                尚未建立任何寵物，請先新增寵物！
              </div>
            )}
          </div>

          {/* 日期 */}
          <div>
            <Label htmlFor="date">日期 <span className="text-destructive">*</span></Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isSubmitting}
              className="focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* 體重 */}
          <div>
            <Label htmlFor="weight">體重 (公斤)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="例如: 5.2"
              disabled={isSubmitting}
              className="focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* 食物攝取量 */}
          <div>
            <Label htmlFor="food">食物攝取量 (公克)</Label>
            <Input
              id="food"
              type="number"
              min="0"
              value={foodGram}
              onChange={(e) => setFoodGram(e.target.value)}
              placeholder="例如: 150"
              disabled={isSubmitting}
              className="focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* 排泄狀況 */}
          <div>
            <Label htmlFor="litter">排泄狀況</Label>
            <Textarea
              id="litter"
              value={litterNotes}
              onChange={(e) => setLitterNotes(e.target.value)}
              placeholder="記錄排泄狀況..."
              disabled={isSubmitting}
              className="focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
          </div>

          {/* 行為記錄 */}
          <div>
            <Label htmlFor="behaviour">行為記錄</Label>
            <Textarea
              id="behaviour"
              value={behaviourNotes}
              onChange={(e) => setBehaviourNotes(e.target.value)}
              placeholder="記錄行為變化..."
              disabled={isSubmitting}
              className="focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedPetId}
              className="flex-1"
            >
              {isSubmitting ? '處理中...' : editingLog ? '更新' : '新增'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}