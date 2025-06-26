"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useState } from "react";
import { MedicalRecordList } from "@/components/medical-records";
import { usePets } from "@/hooks/use-pets";
import { useMedicalRecords } from "@/hooks/use-medical-records";
import { Pet } from "@/lib/types/pet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle, PawPrint } from "lucide-react";

export default function MedicalRecordsPage() {
  const { user, isLoading: userLoading } = useUser();
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  
  // 獲取寵物列表
  const { data: pets = [], isLoading: petsLoading } = usePets();
  
  // 獲取選中寵物的醫療記錄
  const { 
    data: medicalRecords = [], 
    isLoading: medicalRecordsLoading, 
    refetch: refetchMedicalRecords 
  } = useMedicalRecords(selectedPetId, undefined);

  if (userLoading) {
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
        <p className="text-muted-foreground">您需要登入才能管理醫療記錄</p>
      </div>
    );
  }

  if (petsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // 如果沒有寵物，顯示提示
  if (pets.length === 0) {
    return (
      <div className="text-center space-y-4 py-12">
        <PawPrint className="h-12 w-12 text-gray-400 mx-auto" />
        <h1 className="text-2xl font-bold">尚無寵物資料</h1>
        <p className="text-muted-foreground">
          您需要先添加寵物才能管理醫療記錄
        </p>
        <Button onClick={() => window.location.href = '/pets'}>
          前往寵物管理
        </Button>
      </div>
    );
  }

  // 計算所有寵物的醫療記錄統計
  const getAllMedicalRecords = () => {
    // 這裡簡化處理，實際應該要合併所有寵物的記錄
    return medicalRecords;
  };

  const allRecords = getAllMedicalRecords();
  
  // 統計摘要
  const stats = {
    totalRecords: allRecords.length,
    upcomingRecords: allRecords.filter(record => {
      if (!record.next_due_date) return false;
      const nextDue = new Date(record.next_due_date);
      const now = new Date();
      const diffDays = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length,
    overdueRecords: allRecords.filter(record => {
      if (!record.next_due_date) return false;
      const nextDue = new Date(record.next_due_date);
      const now = new Date();
      return nextDue < now;
    }).length,
    recentRecords: allRecords.filter(record => {
      const recordDate = new Date(record.date);
      const now = new Date();
      const diffDays = Math.ceil((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30; // 30天內的記錄
    }).length,
  };

  const selectedPet = pets.find(pet => pet.id === selectedPetId);

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-3xl font-bold">醫療記錄管理</h1>
        <p className="text-muted-foreground">管理您寵物的醫療記錄和健康資訊</p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">總記錄數</p>
                <p className="text-2xl font-bold">{stats.totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">近期記錄</p>
                <p className="text-2xl font-bold">{stats.recentRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">即將到期</p>
                <p className="text-2xl font-bold">{stats.upcomingRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm text-muted-foreground">已過期</p>
                <p className="text-2xl font-bold">{stats.overdueRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 寵物選擇器 */}
      <Card>
        <CardHeader>
          <CardTitle>選擇寵物</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {pets.map((pet) => (
              <Button
                key={pet.id}
                variant={selectedPetId === pet.id ? "default" : "outline"}
                onClick={() => setSelectedPetId(pet.id)}
                className="flex items-center space-x-2"
              >
                <span>{pet.name}</span>
                {pet.breed && (
                  <span className="text-xs text-muted-foreground">
                    ({pet.breed})
                  </span>
                )}
              </Button>
            ))}
          </div>
          {!selectedPetId && (
            <p className="text-sm text-muted-foreground mt-2">
              請選擇一個寵物來查看其醫療記錄
            </p>
          )}
        </CardContent>
      </Card>

      {/* 醫療記錄列表 */}
      {selectedPetId && selectedPet && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedPet.name} 的醫療記錄</CardTitle>
          </CardHeader>
          <CardContent>
            <MedicalRecordList
              petId={selectedPetId}
              records={medicalRecords}
              loading={medicalRecordsLoading}
              onRefresh={refetchMedicalRecords}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}