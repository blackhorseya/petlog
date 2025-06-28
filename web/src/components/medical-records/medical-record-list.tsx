"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MedicalRecordCard } from "./medical-record-card";
import { MedicalRecordModal } from "./medical-record-modal";
import { 
  MedicalRecordTypeLabels,
  type MedicalRecord,
  type MedicalRecordType,
} from "@/lib/types/medical-record";
import { useMedicalRecordManager } from "@/hooks/use-medical-records";
import { Plus, Filter, Calendar, FileX } from "lucide-react";

interface MedicalRecordListProps {
  petId: string;
}

export function MedicalRecordList({
  petId,
}: MedicalRecordListProps) {
  // 使用 API 管理 hook
  const {
    medicalRecords: records,
    loading,
    error,
    refresh: onRefresh,
  } = useMedicalRecordManager(petId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [filterType, setFilterType] = useState<MedicalRecordType | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "type">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // 過濾和排序記錄
  const filteredAndSortedRecords = records
    .filter((record) => filterType === "all" || record.type === filterType)
    .sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      } else {
        const typeA = MedicalRecordTypeLabels[a.type];
        const typeB = MedicalRecordTypeLabels[b.type];
        return sortOrder === "desc" 
          ? typeB.localeCompare(typeA, 'zh-TW') 
          : typeA.localeCompare(typeB, 'zh-TW');
      }
    });

  // 獲取即將到期的記錄
  const upcomingRecords = records.filter((record) => {
    if (!record.next_due_date) return false;
    const nextDue = new Date(record.next_due_date);
    const now = new Date();
    const diffDays = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  });

  // 獲取已過期的記錄
  const overdueRecords = records.filter((record) => {
    if (!record.next_due_date) return false;
    const nextDue = new Date(record.next_due_date);
    const now = new Date();
    return nextDue < now;
  });

  const handleCreateRecord = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    onRefresh?.();
  };

  // 錯誤處理
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <p className="font-medium">載入醫療紀錄時發生錯誤</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          重新載入
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計摘要 */}
      {(upcomingRecords.length > 0 || overdueRecords.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">提醒事項</h3>
          </div>
          {overdueRecords.length > 0 && (
            <p className="text-sm text-red-700 mb-1">
              📍 有 {overdueRecords.length} 項醫療記錄已過期，需要立即處理
            </p>
          )}
          {upcomingRecords.length > 0 && (
            <p className="text-sm text-yellow-700">
              ⏰ 有 {upcomingRecords.length} 項醫療記錄即將到期（7天內）
            </p>
          )}
        </div>
      )}

      {/* 工具列 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          {/* 類型篩選 */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as MedicalRecordType | "all")}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">全部類型</option>
              {Object.entries(MedicalRecordTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 排序選項 */}
          <div className="flex items-center space-x-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by as "date" | "type");
                setSortOrder(order as "asc" | "desc");
              }}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="date-desc">日期（新→舊）</option>
              <option value="date-asc">日期（舊→新）</option>
              <option value="type-asc">類型（A→Z）</option>
              <option value="type-desc">類型（Z→A）</option>
            </select>
          </div>
        </div>

        {/* 新增按鈕 */}
        <Button onClick={handleCreateRecord} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>新增醫療記錄</span>
        </Button>
      </div>

      {/* 記錄清單 */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">載入中...</p>
        </div>
      ) : filteredAndSortedRecords.length === 0 ? (
        <div className="text-center py-12">
          <FileX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filterType === "all" ? "暫無醫療記錄" : `暫無${MedicalRecordTypeLabels[filterType as MedicalRecordType]}記錄`}
          </h3>
          <p className="text-gray-500 mb-4">
            開始為您的寵物建立第一筆醫療記錄吧！
          </p>
          <Button onClick={handleCreateRecord} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            新增醫療記錄
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedRecords.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              onEdit={handleEditRecord}
              loading={loading}
            />
          ))}
        </div>
      )}

      {/* 記錄統計 */}
      {filteredAndSortedRecords.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          {filterType === "all" 
            ? `共 ${records.length} 筆醫療記錄`
            : `共 ${filteredAndSortedRecords.length} 筆${MedicalRecordTypeLabels[filterType as MedicalRecordType]}記錄`
          }
        </div>
      )}

      {/* 新增/編輯模態框 */}
      <MedicalRecordModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        petId={petId}
        editingRecord={editingRecord}
        onSuccess={handleSuccess}
      />
    </div>
  );
}