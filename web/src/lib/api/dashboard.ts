// 本檔案所有 API 呼叫皆統一使用 axios，並自動帶入 access token。
// 如需新增 API，請依照此模式實作。
import { apiRequest } from './request';
import { DashboardOverview, GetDashboardOverviewResponse } from '../types/dashboard';

// Dashboard API 服務
export const dashboardApi = {
  // 獲取首頁概覽 - GET /api/v1/dashboard/overview
  async getDashboardOverview(): Promise<DashboardOverview> {
    const response = await apiRequest<GetDashboardOverviewResponse>('/api/v1/dashboard/overview');
    return {
      petCount: response.pet_count,
      healthRecordCount: response.health_record_count,
    };
  },
};

// React Query hooks 的 key 工廠
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardQueryKeys.all, 'overview'] as const,
};