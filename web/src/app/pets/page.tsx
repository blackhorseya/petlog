"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { PetList } from "@/components/pets/pet-list";
import { PetProfile } from "@/components/pets/pet-profile";
import { PetForm } from "@/components/pets/pet-form";
import { Pet } from "@/lib/types/pet";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PawPrint, Lock } from "lucide-react";
import Link from "next/link";

export default function PetsPage() {
  const { user, isLoading } = useUser();
  const [selectedPet, setSelectedPet] = useState<Pet | undefined>();
  const [isEditingPet, setIsEditingPet] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <PawPrint className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">寵物管理</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            建立和管理您的寵物檔案，記錄基本資訊、照片和重要的健康資料
          </p>
        </div>

        <div className="max-w-2xl mx-auto rounded-lg border border-border bg-card p-8 text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">需要登入才能管理寵物</h2>
          <p className="text-muted-foreground mb-6">
            登入後即可新增、編輯和管理您的寵物資料
          </p>
          <Button asChild size="lg">
            <Link href="/api/auth/login">
              立即登入
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">完整的寵物檔案</h3>
            <p className="text-sm text-muted-foreground">
              記錄寵物的品種、出生日期、體重等基本資訊
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">照片管理</h3>
            <p className="text-sm text-muted-foreground">
              上傳和管理寵物的可愛照片
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">健康追蹤</h3>
            <p className="text-sm text-muted-foreground">
              整合健康記錄與醫療檔案，全面追蹤寵物健康
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handlePetSelect = (pet: Pet) => {
    setSelectedPet(pet);
  };

  const handleBackToList = () => {
    setSelectedPet(undefined);
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setIsEditingPet(true);
  };

  const handleCloseEdit = () => {
    setIsEditingPet(false);
  };

  // 如果選擇了寵物，顯示寵物詳細檔案
  if (selectedPet) {
    return (
      <>
        <PetProfile
          pet={selectedPet}
          onBack={handleBackToList}
          onEdit={handleEditPet}
        />
        <PetForm
          open={isEditingPet}
          onOpenChange={(open) => !open && handleCloseEdit()}
          pet={selectedPet}
          onSuccess={handleCloseEdit}
        />
      </>
    );
  }

  // 顯示寵物列表
  return <PetList onPetSelect={handlePetSelect} />;
}