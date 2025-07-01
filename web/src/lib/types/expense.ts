// 費用紀錄相關類型定義

export interface Expense {
  id: string;
  pet_id: string;
  pet_name: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseRequest {
  pet_id: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
}

export interface UpdateExpenseRequest {
  pet_id?: string;
  category?: string;
  amount?: number;
  description?: string;
  date?: string;
}

export interface ExpenseFilters {
  pet_id?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  keyword?: string;
  page?: number;
  page_size?: number;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  user_id?: string;
  is_default: boolean;
}

export interface ExpenseStatistics {
  total_amount: number;
  total_count: number;
  average_amount: number;
  categories: {
    category: string;
    amount: number;
    count: number;
  }[];
  monthly_summary: {
    month: string;
    amount: number;
    count: number;
  }[];
}