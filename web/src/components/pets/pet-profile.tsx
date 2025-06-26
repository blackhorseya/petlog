"use client";

import * as React from "react";
import { ArrowLeft, Edit, Calendar, Hash, Clock, FileText, Stethoscope, Syringe } from "lucide-react";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Pet } from "@/lib/types/pet";
import { MedicalRecordList } from "@/components/medical-records";

// 暫時的類型定義，等後端 API 定義完成後會替換
type MedicalRecordType = 
  | "vaccination"
  | "deworming" 
  | "medication"
  | "vet_visit"
  | "other";

interface MedicalRecord {
  id: string;
  pet_id: string;
  type: MedicalRecordType;
  description: string;
  date: string;
  next_due_date?: string;
  dosage?: string;
}

interface PetProfileProps {
  pet: Pet;
  onBack?: () => void;
  onEdit?: (pet: Pet) => void;
}

export function PetProfile({ pet, onBack, onEdit }: PetProfileProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "medical">("overview");
  
  // TODO: 等後端 API 完成後，這裡會用真實的 API 來獲取醫療記錄
  // 目前使用 mock 資料來展示功能
  const mockMedicalRecords: MedicalRecord[] = [
    {
      id: "1",
      pet_id: pet.id,
      type: "vaccination",
      description: "狂犬病疫苗注射",
      date: "2024-01-15T09:00:00Z",
      next_due_date: "2025-01-15T09:00:00Z",
      dosage: "1 劑"
    },
    {
      id: "2", 
      pet_id: pet.id,
      type: "deworming",
      description: "定期驅蟲治療",
      date: "2024-02-01T10:30:00Z",
      next_due_date: "2024-05-01T10:30:00Z",
      dosage: "1 錠"
    },
    {
      id: "3",
      pet_id: pet.id, 
      type: "vet_visit",
      description: "健康檢查",
      date: "2024-03-10T14:00:00Z",
    }
  ];
  
  const medicalRecords = mockMedicalRecords;
  const medicalRecordsLoading = false;
  const refetchMedicalRecords = () => {
    console.log('重新整理醫療記錄');
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
    } catch {
      return "日期無效";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "日期時間無效";
    }
  };

  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    
    try {
      const dob = new Date(dobString);
      const today = new Date();
      const ageInMilliseconds = today.getTime() - dob.getTime();
      const ageInDays = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24));
      
      if (ageInDays < 30) {
        return `${ageInDays} 天`;
      } else if (ageInDays < 365) {
        const months = Math.floor(ageInDays / 30);
        return `${months} 個月`;
      } else {
        const years = Math.floor(ageInDays / 365);
        const remainingDays = ageInDays % 365;
        const remainingMonths = Math.floor(remainingDays / 30);
        
        if (remainingMonths > 0) {
          return `${years} 歲 ${remainingMonths} 個月`;
        } else {
          return `${years} 歲`;
        }
      }
    } catch {
      return null;
    }
  };

  const age = calculateAge(pet.dob);

  // 醫療記錄統計
  const medicalRecordStats = {
    total: medicalRecords.length,
    vaccination: medicalRecords.filter(r => r.type === 'vaccination').length,
    vetVisit: medicalRecords.filter(r => r.type === 'vet_visit').length,
    upcoming: medicalRecords.filter(record => {
      if (!record.next_due_date) return false;
      const nextDue = new Date(record.next_due_date);
      const now = new Date();
      const diffDays = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length,
    overdue: medicalRecords.filter(record => {
      if (!record.next_due_date) return false;
      const nextDue = new Date(record.next_due_date);
      const now = new Date();
      return nextDue < now;
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* 標題列 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            <p className="text-muted-foreground">寵物詳細檔案</p>
          </div>
        </div>
        {onEdit && (
          <Button onClick={() => onEdit(pet)}>
            <Edit className="mr-2 h-4 w-4" />
            編輯
          </Button>
        )}
      </div>

      {/* 分頁導航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            基本資料
          </button>
          <button
            onClick={() => setActiveTab("medical")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "medical"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            醫療記錄
            {medicalRecordStats.total > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                {medicalRecordStats.total}
              </span>
            )}
            {medicalRecordStats.overdue > 0 && (
              <span className="ml-1 bg-red-100 text-red-600 py-0.5 px-1.5 rounded-full text-xs">
                !
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* 分頁內容 */}
      {activeTab === "overview" && (
        <>
          {/* 主要資訊卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar
              src={pet.avatar_url}
              alt={pet.name}
              size="2xl"
              fallback={pet.name.charAt(0).toUpperCase()}
            />
            <div>
              <CardTitle className="text-2xl">{pet.name}</CardTitle>
              {pet.breed && (
                <p className="text-lg text-muted-foreground">{pet.breed}</p>
              )}
              {age && (
                <p className="text-sm text-muted-foreground">年齡：{age}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本資訊 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">基本資訊</h3>
              
              {pet.dob && (
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">生日</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(pet.dob)}
                    </p>
                  </div>
                </div>
              )}

              {pet.microchip_id && (
                <div className="flex items-start space-x-3">
                  <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">晶片號碼</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {pet.microchip_id}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">建立日期</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(pet.created_at)}
                  </p>
                </div>
              </div>

              {pet.updated_at !== pet.created_at && (
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">最後更新</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(pet.updated_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 照片或額外資訊區域 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">照片</h3>
              {pet.avatar_url ? (
                <div className="aspect-square max-w-xs">
                  <img
                    src={pet.avatar_url}
                    alt={`${pet.name} 的照片`}
                    className="w-full h-full object-cover rounded-lg border"
                  />
                </div>
              ) : (
                <div className="aspect-square max-w-xs bg-muted rounded-lg border flex items-center justify-center">
                  <p className="text-muted-foreground">尚未上傳照片</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

          {/* 快捷操作卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab("medical")}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  {medicalRecordStats.total}
                </div>
                <p className="text-sm text-muted-foreground">醫療記錄</p>
                {medicalRecordStats.overdue > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {medicalRecordStats.overdue} 項已過期
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab("medical")}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Syringe className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  {medicalRecordStats.vaccination}
                </div>
                <p className="text-sm text-muted-foreground">疫苗記錄</p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab("medical")}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  {medicalRecordStats.vetVisit}
                </div>
                <p className="text-sm text-muted-foreground">獸醫門診</p>
                {medicalRecordStats.upcoming > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    {medicalRecordStats.upcoming} 項即將到期
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* 醫療記錄分頁 */}
      {activeTab === "medical" && (
        <MedicalRecordList
          petId={pet.id}
          records={medicalRecords}
          loading={medicalRecordsLoading}
          onRefresh={refetchMedicalRecords}
        />
      )}
    </div>
  );
}