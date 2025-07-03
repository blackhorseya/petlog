// 費用紀錄相關類型定義（基於 Swagger 規格）

// 基本費用模型（對應 model.Expense）
export interface Expense {
  id: string;
  pet_id: string;
  // pet_name 是客戶端額外加入的，非來自後端 model
  pet_name?: string;
  category: string;
  amount: number;
  description?: string;
  date: string; // RFC3339 格式
  created_at: string;
  updated_at: string;
}

// 新增費用請求（對應 endpoint.CreateExpenseRequest）
export interface CreateExpenseRequest {
  pet_id: string;
  category: string;
  amount: number;
  description?: string;
  date: string; // RFC3339 格式
}

// 更新費用請求（對應 endpoint.UpdateExpenseRequest）
export interface UpdateExpenseRequest {
  id: string;
  pet_id: string;
  category: string;
  amount: number;
  description?: string;
  date: string; // RFC3339 格式
}

// 費用篩選參數（基於 API query parameters）
export interface ExpenseFilters {
  pet_id?: string;
  category?: string;
  start_date?: string; // RFC3339 格式
  end_date?: string; // RFC3339 格式
  // 分頁參數，由前端實作
  page?: number;
  limit?: number;
}

// API Response 格式（對應 endpoint.ListExpensesResponse）
export interface ListExpensesResponse {
  expenses: Expense[];
  error?: any;
}

// 單筆費用回應（對應 endpoint.GetExpenseResponse）
export interface GetExpenseResponse {
  expense: Expense;
  error?: any;
}

// 新增費用回應（對應 endpoint.CreateExpenseResponse）
export interface CreateExpenseResponse {
  expense: Expense;
  error?: any;
}

// 更新費用回應（對應 endpoint.UpdateExpenseResponse）
export interface UpdateExpenseResponse {
  expense: Expense;
  error?: any;
}

// 刪除費用回應（對應 endpoint.DeleteExpenseResponse）
export interface DeleteExpenseResponse {
  error?: any;
}

// 費用摘要回應（對應 endpoint.GetExpenseSummaryResponse）
export interface ExpenseSummary {
  total_amount: number;
  category_stats: Record<string, number>;
  recent: Expense[];
  error?: any;
}

// 分類相關類型（用於 UI 顯示）
export interface ExpenseCategory {
  id: string;
  name: string;
  user_id?: string;
  is_default: boolean;
}