"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MedicalRecordForm } from "./medical-record-form";
import { 
  MedicalRecord, 
  MedicalRecordFormData 
} from "@/lib/types/medical-record";
import { 
  useCreateMedicalRecord, 
  useUpdateMedicalRecord, 
  useDeleteMedicalRecord 
} from "@/hooks/use-medical-records";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

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
  
  const createMutation = useCreateMedicalRecord();
  const updateMutation = useUpdateMedicalRecord();
  const deleteMutation = useDeleteMedicalRecord();

  const isEditing = !!editingRecord;
  const loading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleSubmit = async (data: MedicalRecordFormData) => {
    try {
      if (isEditing && editingRecord) {
        await updateMutation.mutateAsync({
          id: editingRecord.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      // 錯誤處理已在 hooks 中完成
      console.error('Form submission error:', error);
    }
  };

  const handleDelete = async () => {
    if (!editingRecord) return;
    
    try {
      await deleteMutation.mutateAsync(editingRecord.id);
      setShowDeleteConfirm(false);
      onSuccess?.();
    } catch (error) {
      console.error('Delete error:', error);
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