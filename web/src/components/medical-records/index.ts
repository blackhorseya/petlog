export { MedicalRecordForm } from "./medical-record-form";
export { MedicalRecordCard } from "./medical-record-card";
export { MedicalRecordList } from "./medical-record-list";
export { MedicalRecordModal } from "./medical-record-modal";

// 重新導出類型定義
export type {
  MedicalRecord,
  MedicalRecordType,
  MedicalRecordFormData,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  ListMedicalRecordsParams,
} from "@/lib/types/medical-record";