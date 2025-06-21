"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useCreatePet, useUpdatePet } from "@/hooks/use-pets";
import { Pet, PetFormData } from "@/lib/types/pet";

// 表單驗證 schema
const petFormSchema = z.object({
  name: z
    .string()
    .min(1, "寵物名稱是必填的")
    .max(50, "寵物名稱不能超過 50 個字元"),
  dob: z.string().min(1, '出生日期為必填'),
  avatar_url: z
    .string()
    .url("請輸入有效的 URL")
    .optional()
    .or(z.literal("")),
  breed: z.string().optional(),
  microchip_id: z.string().optional(),
});

interface PetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pet?: Pet; // 如果提供，則為編輯模式
  onSuccess?: () => void;
}

export function PetForm({ open, onOpenChange, pet, onSuccess }: PetFormProps) {
  const isEditing = !!pet;
  const createPetMutation = useCreatePet();
  const updatePetMutation = useUpdatePet();

  const form = useForm<PetFormData>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: pet?.name || "",
      avatar_url: pet?.avatar_url || "",
      dob: pet?.dob ? new Date(pet.dob).toISOString().split('T')[0] : "",
      breed: pet?.breed || "",
      microchip_id: pet?.microchip_id || "",
    },
  });

  // 當 pet 改變時重置表單
  React.useEffect(() => {
    if (pet) {
      form.reset({
        name: pet.name,
        avatar_url: pet.avatar_url || "",
        dob: pet.dob ? new Date(pet.dob).toISOString().split('T')[0] : "",
        breed: pet.breed || "",
        microchip_id: pet.microchip_id || "",
      });
    } else {
      form.reset({
        name: "",
        avatar_url: "",
        dob: "",
        breed: "",
        microchip_id: "",
      });
    }
  }, [pet, form]);

  const onSubmit = async (data: PetFormData) => {
    try {
      const submissionData = {
        ...data,
        dob: new Date(data.dob).toISOString(),
      };

      if (isEditing) {
        await updatePetMutation.mutateAsync({
          id: pet.id,
          data: submissionData,
        });
      } else {
        await createPetMutation.mutateAsync(submissionData);
      }
      
      // 成功後關閉對話框並重置表單
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      // 錯誤已經在 mutation 中處理
      console.error("表單提交錯誤:", error);
    }
  };

  const isLoading = createPetMutation.isPending || updatePetMutation.isPending;

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={handleClose} />
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "編輯寵物資訊" : "新增寵物"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "更新您寵物的基本資訊"
              : "添加一隻新寵物到您的檔案中"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="寵物名稱"
            placeholder="請輸入寵物名稱"
            error={form.formState.errors.name?.message}
            required
            {...form.register("name")}
          />

          <Input
            label="出生日期"
            type="date"
            error={form.formState.errors.dob?.message}
            required
            {...form.register("dob")}
          />

          <Input
            label="品種"
            placeholder="例如：米克斯"
            error={form.formState.errors.breed?.message}
            {...form.register("breed")}
          />

          <Input
            label="晶片號碼"
            placeholder="請輸入晶片號碼"
            error={form.formState.errors.microchip_id?.message}
            {...form.register("microchip_id")}
          />

          <Input
            label="頭像 URL"
            placeholder="https://example.com/pet-photo.jpg"
            error={form.formState.errors.avatar_url?.message}
            helper="可選：提供寵物照片的網址"
            {...form.register("avatar_url")}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "更新" : "新增"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}