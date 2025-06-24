// 健康日誌建立請求，對應 endpoint.CreateHealthLogRequest
export interface CreateHealthLogRequest {
  pet_id: string; // 寵物 ID
  date: string; // 記錄日期（RFC3339 格式）
  food_gram?: number; // 食物攝取量（公克）
  weight_kg?: number; // 體重（公斤）
  litter_notes?: string; // 排泄狀況備註
  behaviour_notes?: string; // 行為備註
}

// 健康日誌主體，對應 model.HealthLog
export interface HealthLog {
  id: string;
  pet_id: string;
  date: string;
  food_gram?: number;
  weight_kg?: number;
  litter_notes?: string;
  behaviour_notes?: string;
}

// 建立/查詢/更新健康日誌 API 回應
export interface HealthLogResponse {
  health_log: HealthLog;
  error?: any;
}

// 健康日誌列表回應
export interface HealthLogListResponse {
  health_logs: HealthLog[];
  error?: any;
}

// 刪除健康日誌回應
export interface DeleteHealthLogResponse {
  success: boolean;
  error?: any;
} 