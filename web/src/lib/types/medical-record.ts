// 醫療記錄類型定義，對應後端 model.MedicalRecord
export type MedicalRecordType = 
  | "vaccination"
  | "deworming" 
  | "medication"
  | "vet_visit"
  | "other";

// 醫療記錄類型的中文顯示名稱
export const MedicalRecordTypeLabels: Record<MedicalRecordType, string> = {
  vaccination: "疫苗接種",
  deworming: "驅蟲",
  medication: "用藥",
  vet_visit: "獸醫門診",
  other: "其他",
};

// 醫療記錄模型
export interface MedicalRecord {
  id: string;
  pet_id: string;
  type: MedicalRecordType;
  description: string;
  date: string; // RFC3339 格式
  next_due_date?: string; // RFC3339 格式，可選
  dosage?: string; // 可選
}

// 建立醫療記錄請求類型
export interface CreateMedicalRecordRequest {
  pet_id: string;
  type: MedicalRecordType;
  description: string;
  date: string;
  next_due_date?: string;
  dosage?: string;
}

// 更新醫療記錄請求類型  
export interface UpdateMedicalRecordRequest {
  id: string;
  type: MedicalRecordType;
  description: string;
  date: string;
  next_due_date?: string;
  dosage?: string;
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

export interface ListMedicalRecordsResponse {
  medical_records: MedicalRecord[];
  error?: any;
}

export interface UpdateMedicalRecordResponse {
  error?: any;
}

export interface DeleteMedicalRecordResponse {
  error?: any;
}

// 表單類型定義
export interface MedicalRecordFormData {
  pet_id: string;
  type: MedicalRecordType;
  description: string;
  date: string;
  next_due_date?: string;
  dosage?: string;
}

// 查詢參數類型
export interface MedicalRecordQueryParams {
  pet_id?: string;
  start_date?: string;
  end_date?: string;
  type?: MedicalRecordType;
}