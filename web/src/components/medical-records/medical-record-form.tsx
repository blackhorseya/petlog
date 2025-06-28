"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  MedicalRecordTypeLabels,
  type MedicalRecordFormData,
  type MedicalRecordType,
} from "@/lib/types/medical-record";

interface MedicalRecordFormProps {
  initialData?: Partial<MedicalRecordFormData>;
  petId?: string;
  onSubmit: (data: MedicalRecordFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function MedicalRecordForm({
  initialData,
  petId,
  onSubmit,
  onCancel,
  loading = false,
}: MedicalRecordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<MedicalRecordFormData>({
    defaultValues: {
      pet_id: petId || initialData?.pet_id || "",
      type: initialData?.type || "vaccination",
      description: initialData?.description || "",
      date: initialData?.date || new Date().toISOString().split('T')[0],
      next_due_date: initialData?.next_due_date || "",
      dosage: initialData?.dosage || "",
    },
  });

  const watchedType = watch("type");

  const handleFormSubmit = (data: MedicalRecordFormData) => {
    // 確保必要欄位存在
    const finalPetId = petId || data.pet_id;
    if (!finalPetId) {
      console.error("Pet ID is required for medical record");
      return;
    }

    const formattedData: MedicalRecordFormData = {
      ...data,
      pet_id: finalPetId,
      // 將日期轉換為 RFC3339 格式
      date: new Date(data.date).toISOString(),
      next_due_date: data.next_due_date 
        ? new Date(data.next_due_date).toISOString() 
        : undefined,
    };

    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* 醫療記錄類型 */}
      <div className="space-y-2">
        <Label htmlFor="type">醫療記錄類型 *</Label>
        <select
          id="type"
          {...register("type", { required: "請選擇醫療記錄類型" })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {Object.entries(MedicalRecordTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* 描述 */}
      <div className="space-y-2">
        <Label htmlFor="description">描述 *</Label>
        <Textarea
          id="description"
          placeholder="請描述醫療記錄的詳細內容..."
          {...register("description", { required: "請填寫描述" })}
          className="min-h-20"
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* 日期 */}
      <div className="space-y-2">
        <Label htmlFor="date">日期 *</Label>
        <Input
          id="date"
          type="date"
          {...register("date", { required: "請選擇日期" })}
        />
        {errors.date && (
          <p className="text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      {/* 下次預定日期 (可選) */}
      <div className="space-y-2">
        <Label htmlFor="next_due_date">下次預定日期</Label>
        <Input
          id="next_due_date"
          type="date"
          {...register("next_due_date")}
        />
        <p className="text-sm text-gray-500">
          適用於疫苗接種、驅蟲等需要定期重複的醫療記錄
        </p>
      </div>

      {/* 劑量 (可選) - 只有特定類型才顯示 */}
      {(watchedType === "medication" || watchedType === "vaccination" || watchedType === "deworming") && (
        <div className="space-y-2">
          <Label htmlFor="dosage">劑量</Label>
          <Input
            id="dosage"
            placeholder="例如：1 錠、5ml、1 次等"
            {...register("dosage")}
          />
          <p className="text-sm text-gray-500">
            請填寫用藥劑量或疫苗劑量
          </p>
        </div>
      )}

      {/* 操作按鈕 */}
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "儲存中..." : "儲存"}
        </Button>
      </div>
    </form>
  );
}