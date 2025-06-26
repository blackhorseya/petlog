import {
  MedicalRecord,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  CreateMedicalRecordResponse,
  GetMedicalRecordResponse,
  ListMedicalRecordsResponse,
  UpdateMedicalRecordResponse,
  DeleteMedicalRecordResponse,
  MedicalRecordQueryParams,
} from "../types/medical-record";
import { apiRequest } from "./request";

// 醫療記錄 API 服務
export const medicalRecordApi = {
  // 獲取指定寵物的醫療記錄 - GET /api/v1/pets/{petId}/medical-records
  async listMedicalRecords(
    petId: string,
    params?: MedicalRecordQueryParams
  ): Promise<MedicalRecord[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.start_date) {
      searchParams.append("start_date", params.start_date);
    }
    if (params?.end_date) {
      searchParams.append("end_date", params.end_date);
    }
    if (params?.type) {
      searchParams.append("type", params.type);
    }

    const queryString = searchParams.toString();
    const url = `/api/v1/pets/${petId}/medical-records${queryString ? `?${queryString}` : ""}`;
    
    const response = await apiRequest<ListMedicalRecordsResponse>(url);
    return response.medical_records;
  },

  // 根據 ID 獲取醫療記錄 - GET /api/v1/medical-records/{id}
  async getMedicalRecordById(id: string): Promise<MedicalRecord> {
    const response = await apiRequest<GetMedicalRecordResponse>(
      `/api/v1/medical-records/${id}`
    );
    return response.medical_record;
  },

  // 建立新醫療記錄 - POST /api/v1/medical-records
  async createMedicalRecord(recordData: CreateMedicalRecordRequest): Promise<MedicalRecord> {
    const response = await apiRequest<CreateMedicalRecordResponse>(
      "/api/v1/medical-records",
      {
        method: "POST",
        data: recordData,
      }
    );
    return response.medical_record;
  },

  // 更新醫療記錄 - PUT /api/v1/medical-records/{id}
  async updateMedicalRecord(
    id: string,
    recordData: Omit<UpdateMedicalRecordRequest, "id">
  ): Promise<void> {
    await apiRequest<UpdateMedicalRecordResponse>(
      `/api/v1/medical-records/${id}`,
      {
        method: "PUT",
        data: { ...recordData, id },
      }
    );
  },

  // 刪除醫療記錄 - DELETE /api/v1/medical-records/{id}
  async deleteMedicalRecord(id: string): Promise<void> {
    await apiRequest<DeleteMedicalRecordResponse>(
      `/api/v1/medical-records/${id}`,
      {
        method: "DELETE",
      }
    );
  },
};

// React Query hooks 的 key 工廠
export const medicalRecordQueryKeys = {
  all: ["medical-records"] as const,
  lists: () => [...medicalRecordQueryKeys.all, "list"] as const,
  list: (petId: string, params?: MedicalRecordQueryParams) =>
    [...medicalRecordQueryKeys.lists(), petId, { params }] as const,
  details: () => [...medicalRecordQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...medicalRecordQueryKeys.details(), id] as const,
};