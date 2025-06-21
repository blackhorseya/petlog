"use client";

import * as React from "react";
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Pet } from "@/lib/types/pet";
import { useDeletePet } from "@/hooks/use-pets";

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onView?: (pet: Pet) => void;
}

export function PetCard({ pet, onEdit, onView }: PetCardProps) {
  const [showActions, setShowActions] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const deletePetMutation = useDeletePet();

  const handleDelete = async () => {
    try {
      await deletePetMutation.mutateAsync(pet.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // 錯誤已經在 mutation 中處理
      console.error("刪除寵物失敗:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "日期無效";
    }
  };

  return (
    <Card className="relative group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              src={pet.avatar_url}
              alt={pet.name}
              size="lg"
              fallback={pet.name.charAt(0).toUpperCase()}
            />
            <div>
              <h3 className="font-semibold text-lg">{pet.name}</h3>
              {pet.breed && (
                <p className="text-sm text-muted-foreground">{pet.breed}</p>
              )}
            </div>
          </div>

          {/* 操作選單 */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-background border rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => {
                      onView?.(pet);
                      setShowActions(false);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    查看
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => {
                      onEdit?.(pet);
                      setShowActions(false);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    編輯
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted text-destructive"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowActions(false);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    刪除
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-muted-foreground">
          {pet.dob && (
            <div>
              <span className="font-medium">生日：</span>
              {formatDate(pet.dob)}
            </div>
          )}
          {pet.microchip_id && (
            <div>
              <span className="font-medium">晶片號碼：</span>
              {pet.microchip_id}
            </div>
          )}
          <div>
            <span className="font-medium">建立日期：</span>
            {formatDate(pet.created_at)}
          </div>
        </div>
      </CardContent>

      {/* 刪除確認對話框 */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-background rounded-lg border shadow-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">確認刪除</h3>
            <p className="text-muted-foreground mb-4">
              您確定要刪除「{pet.name}」嗎？此操作無法復原。
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletePetMutation.isPending}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deletePetMutation.isPending}
              >
                {deletePetMutation.isPending ? "刪除中..." : "刪除"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 點擊外部時關閉操作選單 */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </Card>
  );
}