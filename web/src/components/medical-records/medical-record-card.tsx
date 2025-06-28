"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Clock, Pill } from "lucide-react";
import { 
  MedicalRecordTypeLabels,
  type MedicalRecord,
} from "@/lib/types/medical-record";

interface MedicalRecordCardProps {
  record: MedicalRecord;
  onEdit?: (record: MedicalRecord) => void;
  onDelete?: (recordId: string) => void;
  loading?: boolean;
}

export function MedicalRecordCard({
  record,
  onEdit,
  onDelete,
  loading = false,
}: MedicalRecordCardProps) {
  // 格式化日期顯示
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 根據醫療記錄類型獲取顏色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'deworming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medication':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'vet_visit':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 判斷是否即將到期 (7天內)
  const isUpcoming = (nextDueDateString?: string) => {
    if (!nextDueDateString) return false;
    const nextDue = new Date(nextDueDateString);
    const now = new Date();
    const diffDays = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  // 判斷是否已過期
  const isOverdue = (nextDueDateString?: string) => {
    if (!nextDueDateString) return false;
    const nextDue = new Date(nextDueDateString);
    const now = new Date();
    return nextDue < now;
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(
                record.type
              )}`}
            >
              {MedicalRecordTypeLabels[record.type]}
            </span>
            
            {/* 即將到期或已過期的提醒 */}
            {record.next_due_date && isOverdue(record.next_due_date) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                已過期
              </span>
            )}
            {record.next_due_date && isUpcoming(record.next_due_date) && !isOverdue(record.next_due_date) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                即將到期
              </span>
            )}
          </div>
          
          {/* 操作按鈕 */}
          <div className="flex space-x-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(record)}
                disabled={loading}
              >
                編輯
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(record.id)}
                disabled={loading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                刪除
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 描述 */}
        <div className="flex items-start space-x-2">
          <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 leading-relaxed">
            {record.description}
          </p>
        </div>

        {/* 日期 */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-600">
            {formatDate(record.date)}
          </span>
        </div>

        {/* 劑量（如果有） */}
        {record.dosage && (
          <div className="flex items-center space-x-2">
            <Pill className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              劑量：{record.dosage}
            </span>
          </div>
        )}

        {/* 下次預定日期（如果有） */}
        {record.next_due_date && (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              下次預定：{formatDate(record.next_due_date)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}