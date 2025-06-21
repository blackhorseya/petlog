"use client";

import * as React from "react";
import { ArrowLeft, Edit, Calendar, Hash, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Pet } from "@/lib/types/pet";

interface PetProfileProps {
  pet: Pet;
  onBack?: () => void;
  onEdit?: (pet: Pet) => void;
}

export function PetProfile({ pet, onBack, onEdit }: PetProfileProps) {
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
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <p className="text-sm text-muted-foreground">健康記錄</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <p className="text-sm text-muted-foreground">醫療記錄</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <p className="text-sm text-muted-foreground">疫苗記錄</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}