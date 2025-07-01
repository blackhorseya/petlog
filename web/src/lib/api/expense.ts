import { apiRequest } from './request';
import type {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilters,
  ExpenseListResponse,
  ExpenseCategory,
  ExpenseStatistics,
} from '@/lib/types/expense';

const API_BASE = '/api/v1';

// 費用紀錄 CRUD 操作
export const expenseAPI = {
  // 建立費用紀錄
  async create(data: CreateExpenseRequest): Promise<Expense> {
    return apiRequest<Expense>(`${API_BASE}/expenses`, {
      method: 'POST',
      data: data,
    });
  },

  // 取得單筆費用紀錄
  async getById(id: string): Promise<Expense> {
    return apiRequest<Expense>(`${API_BASE}/expenses/${id}`);
  },

  // 更新費用紀錄
  async update(id: string, data: UpdateExpenseRequest): Promise<Expense> {
    return apiRequest<Expense>(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      data: data,
    });
  },

  // 刪除費用紀錄
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  // 查詢費用紀錄列表
  async list(filters?: ExpenseFilters): Promise<ExpenseListResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const url = params.toString() 
      ? `${API_BASE}/expenses?${params.toString()}`
      : `${API_BASE}/expenses`;

    return apiRequest<ExpenseListResponse>(url);
  },

  // 搜尋費用紀錄
  async search(keyword: string, filters?: Omit<ExpenseFilters, 'keyword'>): Promise<ExpenseListResponse> {
    const searchFilters: ExpenseFilters = { ...filters, keyword };
    return this.list(searchFilters);
  },

  // 依寵物 ID 查詢費用紀錄
  async getByPetId(petId: string, filters?: Omit<ExpenseFilters, 'pet_id'>): Promise<ExpenseListResponse> {
    const petFilters: ExpenseFilters = { ...filters, pet_id: petId };
    return this.list(petFilters);
  },

  // 依日期範圍查詢費用紀錄
  async getByDateRange(
    startDate: string, 
    endDate: string, 
    filters?: Omit<ExpenseFilters, 'start_date' | 'end_date'>
  ): Promise<ExpenseListResponse> {
    const dateFilters: ExpenseFilters = { 
      ...filters, 
      start_date: startDate, 
      end_date: endDate 
    };
    return this.list(dateFilters);
  },

  // 依分類查詢費用紀錄
  async getByCategory(category: string, filters?: Omit<ExpenseFilters, 'category'>): Promise<ExpenseListResponse> {
    const categoryFilters: ExpenseFilters = { ...filters, category };
    return this.list(categoryFilters);
  },

  // 取得費用統計資料
  async getStatistics(filters?: Omit<ExpenseFilters, 'page' | 'page_size'>): Promise<ExpenseStatistics> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const url = params.toString() 
      ? `${API_BASE}/expenses/statistics?${params.toString()}`
      : `${API_BASE}/expenses/statistics`;

    return apiRequest<ExpenseStatistics>(url);
  },
};

// 分類管理 API
export const categoryAPI = {
  // 取得所有分類
  async getAll(): Promise<ExpenseCategory[]> {
    return apiRequest<ExpenseCategory[]>(`${API_BASE}/categories`);
  },

  // 取得預設分類
  async getDefaults(): Promise<ExpenseCategory[]> {
    return apiRequest<ExpenseCategory[]>(`${API_BASE}/categories?default=true`);
  },

  // 取得使用者自訂分類
  async getUserCategories(): Promise<ExpenseCategory[]> {
    return apiRequest<ExpenseCategory[]>(`${API_BASE}/categories?custom=true`);
  },

  // 建立新分類
  async create(name: string): Promise<ExpenseCategory> {
    return apiRequest<ExpenseCategory>(`${API_BASE}/categories`, {
      method: 'POST',
      data: { name },
    });
  },

  // 更新分類
  async update(id: string, name: string): Promise<ExpenseCategory> {
    return apiRequest<ExpenseCategory>(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      data: { name },
    });
  },

  // 刪除分類
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
    });
  },
};