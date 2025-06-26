"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MedicalRecordForm } from "./medical-record-form";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

interface MedicalRecordFormData {
  pet_id: string;
  type: MedicalRecordType;
  description: string;
  date: string;
  next_due_date?: string;
  dosage?: string;
}

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  editingRecord?: MedicalRecord | null;
  onSuccess?: () => void;
}

export function MedicalRecordModal({
  isOpen,
  onClose,
  petId,
  editingRecord,
  onSuccess,
}: MedicalRecordModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditing = !!editingRecord;

  const handleSubmit = async (data: MedicalRecordFormData) => {
    setLoading(true);
    try {
      // TODO: 等後端 API 完成後，這裡會實際呼叫 API
      console.log('醫療記錄資料:', data);
      
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isEditing) {
        toast.success('醫療記錄更新成功！');
      } else {
        toast.success('醫療記錄建立成功！');
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('操作失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingRecord) return;
    
    setLoading(true);
    try {
      // TODO: 等後端 API 完成後，這裡會實際呼叫刪除 API
      console.log('刪除醫療記錄:', editingRecord.id);
      
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('醫療記錄已成功刪除');
      setShowDeleteConfirm(false);
      onSuccess?.();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('刪除失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  // 將 MedicalRecord 轉換為表單數據格式
  const getInitialFormData = (): Partial<MedicalRecordFormData> | undefined => {
    if (!editingRecord) return undefined;
    
    return {
      pet_id: editingRecord.pet_id,
      type: editingRecord.type,
      description: editingRecord.description,
      date: editingRecord.date ? new Date(editingRecord.date).toISOString().split('T')[0] : "",
      next_due_date: editingRecord.next_due_date 
        ? new Date(editingRecord.next_due_date).toISOString().split('T')[0]
        : "",
      dosage: editingRecord.dosage || "",
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditing ? "編輯醫療記錄" : "新增醫療記錄"}
            </DialogTitle>
            
            {/* 刪除按鈕 - 只在編輯模式下顯示 */}
            {isEditing && !showDeleteConfirm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* 刪除確認對話框 */}
        {showDeleteConfirm ? (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-800 mb-2">確認刪除</h3>
              <p className="text-sm text-red-700 mb-4">
                您確定要刪除這筆醫療記錄嗎？此操作無法復原。
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? "刪除中..." : "確定刪除"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <MedicalRecordForm
            petId={petId}
            initialData={getInitialFormData()}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={loading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}