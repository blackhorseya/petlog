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
import {
  getMockExpenses,
  addMockExpense,
  updateMockExpense,
  deleteMockExpense,
  getMockCategories,
  addMockCategory,
  updateMockCategory,
  deleteMockCategory,
  mockStatistics,
  delay,
  shouldSimulateError,
  filterExpenses,
  paginateExpenses,
} from './expense-mock';

const API_BASE = '/api/v1';

// 是否使用 mock data（開發環境下預設為 true）
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// 費用紀錄 CRUD 操作
export const expenseAPI = {
  // 建立費用紀錄
  async create(data: CreateExpenseRequest): Promise<Expense> {
    if (USE_MOCK_DATA) {
      await delay(400);
      
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      // 模擬驗證
      if (!data.pet_id || !data.category || !data.amount || data.amount <= 0) {
        throw new Error('請填寫完整的費用資訊');
      }

      // 創建新費用紀錄
      const newExpense = addMockExpense({
        pet_id: data.pet_id,
        pet_name: data.pet_id === 'pet1' ? '小白' : data.pet_id === 'pet2' ? '黑豆' : '咪咪', // 簡化處理
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: data.date,
      });

      return newExpense;
    }

    return apiRequest<Expense>(`${API_BASE}/expenses`, {
      method: 'POST',
      data: data,
    });
  },

  // 取得單筆費用紀錄
  async getById(id: string): Promise<Expense> {
    if (USE_MOCK_DATA) {
      await delay(200);
      
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      const expense = getMockExpenses().find(e => e.id === id);
      if (!expense) {
        throw new Error('找不到指定的費用紀錄');
      }
      return expense;
    }

    return apiRequest<Expense>(`${API_BASE}/expenses/${id}`);
  },

  // 更新費用紀錄
  async update(id: string, data: UpdateExpenseRequest): Promise<Expense> {
    if (USE_MOCK_DATA) {
      await delay(300);
      
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      // 更新費用紀錄
      const updatedExpense = updateMockExpense(id, {
        pet_id: data.pet_id,
        pet_name: data.pet_id === 'pet1' ? '小白' : data.pet_id === 'pet2' ? '黑豆' : '咪咪', // 簡化處理
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: data.date,
      });

      return updatedExpense;
    }

    return apiRequest<Expense>(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      data: data,
    });
  },

  // 刪除費用紀錄
  async delete(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await delay(200);
      
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      deleteMockExpense(id);
      return;
    }

    return apiRequest<void>(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  // 查詢費用紀錄列表
  async list(filters?: ExpenseFilters): Promise<ExpenseListResponse> {
    if (USE_MOCK_DATA) {
      // 模擬 API 延遲
      await delay(300);
      
      // 模擬偶發錯誤
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      // 篩選資料
      const filteredExpenses = filterExpenses(getMockExpenses(), filters || {});
      
      // 依日期倒序排列
      const sortedExpenses = filteredExpenses.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // 分頁處理
      return paginateExpenses(
        sortedExpenses, 
        filters?.page || 1, 
        filters?.page_size || 20
      );
    }

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
    if (USE_MOCK_DATA) {
      await delay(400);
      
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      // 如果有篩選條件，重新計算統計資料
      if (filters && Object.keys(filters).length > 0) {
        const filteredExpenses = filterExpenses(getMockExpenses(), filters);
        
        const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalCount = filteredExpenses.length;
        const averageAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
        
        // 重新計算分類統計
        const categoryStats = filteredExpenses.reduce((acc, expense) => {
          const existing = acc.find(cat => cat.category === expense.category);
          if (existing) {
            existing.amount += expense.amount;
            existing.count += 1;
          } else {
            acc.push({
              category: expense.category,
              amount: expense.amount,
              count: 1,
            });
          }
          return acc;
        }, [] as { category: string; amount: number; count: number; }[]);
        
        return {
          total_amount: totalAmount,
          total_count: totalCount,
          average_amount: averageAmount,
          categories: categoryStats,
          monthly_summary: mockStatistics.monthly_summary, // 簡化處理
        };
      }

      return mockStatistics;
    }

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
    if (USE_MOCK_DATA) {
      await delay(200);
      
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      return getMockCategories();
    }

    return apiRequest<ExpenseCategory[]>(`${API_BASE}/categories`);
  },

  // 取得預設分類
  async getDefaults(): Promise<ExpenseCategory[]> {
    if (USE_MOCK_DATA) {
      await delay(150);
      
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      return getMockCategories().filter((cat: ExpenseCategory) => cat.is_default);
    }

    return apiRequest<ExpenseCategory[]>(`${API_BASE}/categories?default=true`);
  },

  // 取得使用者自訂分類
  async getUserCategories(): Promise<ExpenseCategory[]> {
    if (USE_MOCK_DATA) {
      await delay(150);
      
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      return getMockCategories().filter((cat: ExpenseCategory) => !cat.is_default);
    }

    return apiRequest<ExpenseCategory[]>(`${API_BASE}/categories?custom=true`);
  },

  // 建立新分類
  async create(name: string): Promise<ExpenseCategory> {
    if (USE_MOCK_DATA) {
      await delay(300);
      
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      if (!name.trim()) {
        throw new Error('分類名稱不能為空');
      }

      // 檢查重複名稱
      const existingCategories = getMockCategories();
      if (existingCategories.some(cat => cat.name === name.trim())) {
        throw new Error('分類名稱已存在');
      }

      return addMockCategory(name.trim());
    }

    return apiRequest<ExpenseCategory>(`${API_BASE}/categories`, {
      method: 'POST',
      data: { name },
    });
  },

  // 更新分類
  async update(id: string, name: string): Promise<ExpenseCategory> {
    if (USE_MOCK_DATA) {
      await delay(250);
      
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      if (!name.trim()) {
        throw new Error('分類名稱不能為空');
      }

      // 檢查重複名稱（排除自己）
      const existingCategories = getMockCategories();
      if (existingCategories.some(cat => cat.id !== id && cat.name === name.trim())) {
        throw new Error('分類名稱已存在');
      }

      return updateMockCategory(id, name.trim());
    }

    return apiRequest<ExpenseCategory>(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      data: { name },
    });
  },

  // 刪除分類
  async delete(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await delay(200);
      
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      deleteMockCategory(id);
      return;
    }

    return apiRequest<void>(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
    });
  },
};