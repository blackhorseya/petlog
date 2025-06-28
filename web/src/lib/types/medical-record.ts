// 醫療紀錄類型枚舉，對應 model.MedicalRecordType
export type MedicalRecordType = 
  | "vaccination"
  | "deworming" 
  | "medication"
  | "vet_visit"
  | "other";

// 醫療紀錄類型標籤
export const MedicalRecordTypeLabels: Record<MedicalRecordType, string> = {
  vaccination: "疫苗接種",
  deworming: "驅蟲",
  medication: "用藥",
  vet_visit: "獸醫門診",
  other: "其他",
};

// 醫療紀錄模型，對應 model.MedicalRecord
export interface MedicalRecord {
  id: string;
  pet_id: string;
  type: MedicalRecordType;
  description: string;
  date: string; // RFC3339 格式
  next_due_date?: string; // RFC3339 格式，可選
  dosage?: string; // 可選
}

// 建立醫療紀錄請求，對應 endpoint.CreateMedicalRecordRequest
export interface CreateMedicalRecordRequest {
  pet_id: string;
  type: MedicalRecordType;
  description: string;
  date: string; // RFC3339 格式
  next_due_date?: string; // RFC3339 格式，可選
  dosage?: string; // 可選
}

// 更新醫療紀錄請求，對應 endpoint.UpdateMedicalRecordRequest
export interface UpdateMedicalRecordRequest {
  id: string;
  pet_id: string;
  type: MedicalRecordType;
  description: string;
  date: string; // RFC3339 格式
  next_due_date?: string; // RFC3339 格式，可選
  dosage?: string; // 可選
}

// API 回應類型
export interface CreateMedicalRecordResponse {
  medical_record: MedicalRecord;
  error?: any;
}

export interface GetMedicalRecordResponse {
  medical_record: MedicalRecord;
  error?: any;
}

export interface ListMedicalRecordsByPetResponse {
  medical_records: MedicalRecord[];
  error?: any;
}

export interface UpdateMedicalRecordResponse {
  medical_record: MedicalRecord;
  error?: any;
}

export interface DeleteMedicalRecordResponse {
  error?: any;
}

// 表單資料類型
export interface MedicalRecordFormData {
  pet_id: string;
  type: MedicalRecordType;
  description: string;
  date: string;
  next_due_date?: string;
  dosage?: string;
}

// 查詢參數類型
export interface ListMedicalRecordsParams {
  pet_id: string;
  start_date?: string; // RFC3339 格式
  end_date?: string; // RFC3339 格式
}