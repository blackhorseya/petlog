"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useState, useMemo } from "react";
import { MedicalRecordList } from "@/components/medical-records";
import { usePets } from "@/hooks/use-pets";
import { useMedicalRecords } from "@/hooks/use-medical-records";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, AlertTriangle, PawPrint, Lock, FileText } from "lucide-react";
import Link from "next/link";

export default function MedicalRecordsPage() {
  const { user, isLoading: userLoading } = useUser();
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  
  // 獲取寵物列表
  const { data: pets = [], isLoading: petsLoading } = usePets();
  
  // 獲取所選寵物的醫療記錄 - 確保 hooks 順序一致
  const { 
    medicalRecords, 
    loading: medicalRecordsLoading 
  } = useMedicalRecords({ pet_id: selectedPetId || "" });

  // 計算統計資料 - 基於當前選中的寵物（必須在條件性 return 之前呼叫）
  const stats = useMemo(() => {
    if (!selectedPetId || !medicalRecords || medicalRecords.length === 0) {
      return {
        totalRecords: 0,
        upcomingRecords: 0,
        overdueRecords: 0,
        recentRecords: 0,
      };
    }

    return {
      totalRecords: medicalRecords.length,
      upcomingRecords: medicalRecords.filter(record => {
        if (!record.next_due_date) return false;
        const nextDue = new Date(record.next_due_date);
        const now = new Date();
        const diffDays = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      }).length,
      overdueRecords: medicalRecords.filter(record => {
        if (!record.next_due_date) return false;
        const nextDue = new Date(record.next_due_date);
        const now = new Date();
        return nextDue < now;
      }).length,
      recentRecords: medicalRecords.filter(record => {
        const recordDate = new Date(record.date);
        const now = new Date();
        const diffDays = Math.ceil((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 30; // 30天內的記錄
      }).length,
    };
  }, [selectedPetId, medicalRecords]);

  const selectedPet = pets.find(pet => pet.id === selectedPetId);

  if (userLoading) {
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
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">醫療記錄</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            管理疫苗接種、體檢報告和重要的醫療文件
          </p>
        </div>

        <div className="max-w-2xl mx-auto rounded-lg border border-border bg-card p-8 text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">需要登入才能管理醫療記錄</h2>
          <p className="text-muted-foreground mb-6">
            登入後即可新增、編輯和查看寵物的醫療記錄
          </p>
          <Button asChild size="lg">
            <Link href="/api/auth/login">
              立即登入
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">疫苗管理</h3>
            <p className="text-sm text-muted-foreground">
              記錄疫苗接種日期，自動提醒下次施打時間
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">體檢報告</h3>
            <p className="text-sm text-muted-foreground">
              儲存定期健檢結果，追蹤健康變化
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">就診記錄</h3>
            <p className="text-sm text-muted-foreground">
              完整記錄每次就醫過程與處方
            </p>
          </div>
        </div>
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
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}