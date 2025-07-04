import { apiRequest } from './request';
import type {
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilters,
  ListExpensesResponse,
  GetExpenseResponse,
  CreateExpenseResponse,
  UpdateExpenseResponse,
  DeleteExpenseResponse,
  ExpenseSummary,
  ExpenseCategory,
} from '@/lib/types/expense';
import {
  getMockCategories,
  addMockCategory,
  updateMockCategory,
  deleteMockCategory,
} from './expense-mock';

const API_BASE = '/api/v1/expenses';

// 費用紀錄 CRUD 操作
export const expenseAPI = {
  // 建立費用紀錄
  async create(data: CreateExpenseRequest): Promise<CreateExpenseResponse> {
    return apiRequest<CreateExpenseResponse>(`${API_BASE}`, {
      method: 'POST',
      data,
    });
  },

  // 取得單筆費用紀錄
  async getById(id: string): Promise<GetExpenseResponse> {
    return apiRequest<GetExpenseResponse>(`${API_BASE}/${id}`);
  },

  // 更新費用紀錄
  async update(id: string, data: UpdateExpenseRequest): Promise<UpdateExpenseResponse> {
    return apiRequest<UpdateExpenseResponse>(`${API_BASE}/${id}`, {
      method: 'PUT',
      data,
    });
  },

  // 刪除費用紀錄
  async delete(id: string): Promise<DeleteExpenseResponse> {
    return apiRequest<DeleteExpenseResponse>(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
  },

  // 查詢費用紀錄列表
  async list(filters?: ExpenseFilters): Promise<ListExpensesResponse> {
    return apiRequest<ListExpensesResponse>(API_BASE, {
      params: filters,
    });
  },

  // 查詢費用摘要
  async summary(filters?: { pet_id?: string }): Promise<ExpenseSummary> {
    return apiRequest<ExpenseSummary>(`${API_BASE}/summary`, {
      params: filters,
    });
  },
};

// 分類 API (目前為 mock)
export const categoryAPI = {
  async getAll(): Promise<ExpenseCategory[]> {
    return getMockCategories();
  },

  async getDefaults(): Promise<ExpenseCategory[]> {
    return getMockCategories().filter(c => c.is_default);
  },

  async getUserCategories(): Promise<ExpenseCategory[]> {
    return getMockCategories().filter(c => !c.is_default);
  },

  async create(name: string): Promise<ExpenseCategory> {
    if (!name.trim()) {
      throw new Error('分類名稱不能為空');
    }
    return addMockCategory(name);
  },

  async update(id: string, name: string): Promise<ExpenseCategory> {
    if (!name.trim()) {
      throw new Error('分類名稱不能為空');
    }
    return updateMockCategory(id, name);
  },

  async delete(id: string): Promise<void> {
    return deleteMockCategory(id);
  },
};