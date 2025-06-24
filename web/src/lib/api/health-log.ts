// 本檔案所有 API 呼叫皆統一使用 axios，並自動帶入 access token。
// 如需新增 API，請依照此模式實作。
import { apiRequest } from './request';
import {
  CreateHealthLogRequest,
  HealthLog,
  HealthLogResponse,
  HealthLogListResponse,
  DeleteHealthLogResponse,
} from '../types/health-log';

// 建立健康日誌
export async function createHealthLog(input: CreateHealthLogRequest): Promise<HealthLogResponse> {
  return apiRequest<HealthLogResponse>('/api/v1/health-logs', {
    method: 'POST',
    data: input,
  });
}

// 取得健康日誌列表（依寵物 ID 與可選日期區間）
export async function listHealthLogsByPet(params: {
  pet_id: string;
  start_date?: string;
  end_date?: string;
}): Promise<HealthLogListResponse> {
  return apiRequest<HealthLogListResponse>('/api/v1/health-logs', {
    method: 'GET',
    params,
  });
}

// 取得單一健康日誌
export async function getHealthLogById(id: string): Promise<HealthLogResponse> {
  return apiRequest<HealthLogResponse>(`/api/v1/health-logs/${id}`);
}

// 更新健康日誌
export async function updateHealthLog(id: string, input: Partial<CreateHealthLogRequest>): Promise<HealthLogResponse> {
  return apiRequest<HealthLogResponse>(`/api/v1/health-logs/${id}`, {
    method: 'PUT',
    data: input,
  });
}

// 刪除健康日誌
export async function deleteHealthLog(id: string): Promise<DeleteHealthLogResponse> {
  return apiRequest<DeleteHealthLogResponse>(`/api/v1/health-logs/${id}`, {
    method: 'DELETE',
  });
} 