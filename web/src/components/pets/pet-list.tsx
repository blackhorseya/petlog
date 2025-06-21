"use client";

import * as React from "react";
import { PawPrint, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PetCard } from "./pet-card";
import { PetForm } from "./pet-form";
import { usePets } from "@/hooks/use-pets";
import { Pet } from "@/lib/types/pet";

interface PetListProps {
  onPetSelect?: (pet: Pet) => void;
}

export function PetList({ onPetSelect }: PetListProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingPet, setEditingPet] = React.useState<Pet | undefined>();

  const { data: pets, isLoading, error } = usePets();

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setIsFormOpen(true);
  };

  const handleView = (pet: Pet) => {
    onPetSelect?.(pet);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPet(undefined);
  };

  const handleAddNew = () => {
    setEditingPet(undefined);
    setIsFormOpen(true);
  };

  // 載入狀態
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">我的寵物</h1>
            <p className="text-muted-foreground">管理您的寵物檔案和基本資訊</p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            新增寵物
          </Button>
        </div>

        {/* 載入中的骨架屏 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 bg-muted rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">我的寵物</h1>
            <p className="text-muted-foreground">管理您的寵物檔案和基本資訊</p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            新增寵物
          </Button>
        </div>

        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <PawPrint className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-destructive">
            載入寵物資料失敗
          </h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "發生未知錯誤"}
          </p>
          <Button onClick={() => window.location.reload()}>
            重新載入
          </Button>
        </div>
      </div>
    );
  }

  // 空狀態
  if (!pets || pets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">我的寵物</h1>
            <p className="text-muted-foreground">管理您的寵物檔案和基本資訊</p>
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            新增寵物
          </Button>
        </div>

        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <PawPrint className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">還沒有寵物</h3>
          <p className="text-muted-foreground mb-4">
            開始新增您的第一隻寵物，建立專屬的健康檔案
          </p>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            新增寵物
          </Button>
        </div>

        <PetForm
          open={isFormOpen}
          onOpenChange={handleCloseForm}
          pet={editingPet}
        />
      </div>
    );
  }

  // 正常狀態 - 顯示寵物列表
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">我的寵物</h1>
          <p className="text-muted-foreground">
            管理您的寵物檔案和基本資訊（{pets.length} 隻寵物）
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          新增寵物
        </Button>
      </div>

      {/* 寵物網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onEdit={handleEdit}
            onView={handleView}
          />
        ))}
      </div>

      {/* 寵物表單對話框 */}
      <PetForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        pet={editingPet}
      />
    </div>
  );
}