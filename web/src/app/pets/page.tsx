"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { PetList } from "@/components/pets/pet-list";
import { PetProfile } from "@/components/pets/pet-profile";
import { PetForm } from "@/components/pets/pet-form";
import { Pet } from "@/lib/types/pet";
import { useState } from "react";

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
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">請先登入</h1>
        <p className="text-muted-foreground">您需要登入才能管理寵物</p>
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