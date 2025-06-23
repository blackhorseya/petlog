// 本檔案所有 API 呼叫皆統一使用 axios，並自動帶入 access token。
// 如需新增 API，請依照此模式實作。
import { apiRequest } from './request';
import { CreateHealthLogInput } from '../types/health-log';

export async function createHealthLog(input: CreateHealthLogInput) {
  await apiRequest('/api/v1/health-logs', {
    method: 'POST',
    data: input,
  });
} 