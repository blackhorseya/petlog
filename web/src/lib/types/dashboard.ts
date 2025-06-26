// Dashboard 概覽回應類型，對應 endpoint.GetDashboardOverviewResponse
export interface DashboardOverview {
  petCount: number; // 寵物數量
  healthRecordCount: number; // 健康日誌數量
}

// Dashboard API 回應類型
export interface GetDashboardOverviewResponse {
  pet_count: number;
  health_record_count: number;
  error?: any;
}