import { apiRequest } from "./request";
import type {
  MedicalRecord,
  CreateMedicalRecordRequest,
  CreateMedicalRecordResponse,
  UpdateMedicalRecordRequest,
  UpdateMedicalRecordResponse,
  GetMedicalRecordResponse,
  ListMedicalRecordsByPetResponse,
  DeleteMedicalRecordResponse,
  ListMedicalRecordsParams,
} from "@/lib/types/medical-record";

/**
 * 列出寵物的醫療紀錄
 */
export async function listMedicalRecordsByPet(
  params: ListMedicalRecordsParams
): Promise<MedicalRecord[]> {
  const response = await apiRequest<ListMedicalRecordsByPetResponse>(
    "/api/v1/medical-records",
    {
      method: "GET",
      params,
    }
  );
  return response.medical_records;
}

/**
 * 根據 ID 取得醫療紀錄詳情
 */
export async function getMedicalRecordById(id: string): Promise<MedicalRecord> {
  const response = await apiRequest<GetMedicalRecordResponse>(
    `/api/v1/medical-records/${id}`,
    {
      method: "GET",
    }
  );
  return response.medical_record;
}

/**
 * 建立新的醫療紀錄
 */
export async function createMedicalRecord(
  data: CreateMedicalRecordRequest
): Promise<MedicalRecord> {
  const response = await apiRequest<CreateMedicalRecordResponse>(
    "/api/v1/medical-records",
    {
      method: "POST",
      data,
    }
  );
  return response.medical_record;
}

/**
 * 更新醫療紀錄
 */
export async function updateMedicalRecord(
  id: string,
  data: Omit<UpdateMedicalRecordRequest, "id">
): Promise<MedicalRecord> {
  const response = await apiRequest<UpdateMedicalRecordResponse>(
    `/api/v1/medical-records/${id}`,
    {
      method: "PUT",
      data: { ...data, id },
    }
  );
  return response.medical_record;
}

/**
 * 刪除醫療紀錄
 */
export async function deleteMedicalRecord(id: string): Promise<void> {
  await apiRequest<DeleteMedicalRecordResponse>(
    `/api/v1/medical-records/${id}`,
    {
      method: "DELETE",
    }
  );
}