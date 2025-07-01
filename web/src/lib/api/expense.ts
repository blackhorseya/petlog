import { apiRequest } from './request';
import type {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilters,
  ListExpensesResponse,
  GetExpenseResponse,
  CreateExpenseResponse,
  UpdateExpenseResponse,
  DeleteExpenseResponse,
  ExpenseStatistics,
  ExpenseCategory,
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
  delay,
  shouldSimulateError,
  filterExpenses,
} from './expense-mock';

const API_BASE = '/api/v1';

// 是否使用 mock data（開發環境下預設為 true）
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// 擴展 Expense 類型來包含 pet_name（前端顯示用）
export interface ExpenseWithPetName extends Expense {
  pet_name: string;
}

// 模擬的分頁回應（用於兼容現有前端組件）
export interface MockExpenseListResponse {
  expenses: ExpenseWithPetName[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 轉換函數：從 API 回應到前端使用的格式
function enhanceExpenseWithPetName(expense: Expense): ExpenseWithPetName {
  // 簡化映射（實際應該從寵物 API 獲取）
  const petNameMap: Record<string, string> = {
    'pet1': '小白',
    'pet2': '黑豆', 
    'pet3': '咪咪',
  };
  
  return {
    ...expense,
    pet_name: petNameMap[expense.pet_id] || '未知寵物',
  };
}

// 創建模擬分頁回應
function createMockPaginationResponse(
  expenses: ExpenseWithPetName[], 
  page: number = 1, 
  pageSize: number = 20
): MockExpenseListResponse {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedExpenses = expenses.slice(startIndex, endIndex);
  
  return {
    expenses: paginatedExpenses,
    total: expenses.length,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(expenses.length / pageSize),
  };
}

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

  // 查詢費用紀錄列表（兼容分頁格式）
  async list(filters?: ExpenseFilters & { page?: number; page_size?: number }): Promise<MockExpenseListResponse> {
    if (USE_MOCK_DATA) {
      // 模擬 API 延遲
      await delay(300);
      
      // 模擬偶發錯誤
      if (shouldSimulateError()) {
        throw new Error('模擬網路錯誤');
      }

      // 篩選資料
      const mockExpenses = getMockExpenses().map(enhanceExpenseWithPetName);
      const filteredExpenses = filterExpenses(mockExpenses, filters || {});
      
      // 依日期倒序排列
      const sortedExpenses = filteredExpenses.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // 分頁處理
      return createMockPaginationResponse(
        sortedExpenses, 
        filters?.page || 1, 
        filters?.page_size || 20
      );
    }

    // 真實 API 調用
    const params = new URLSearchParams();
    
    if (filters) {
      // 只傳遞 API 支援的參數
      const apiFilters = {
        pet_id: filters.pet_id,
        category: filters.category,
        start_date: filters.start_date,
        end_date: filters.end_date,
      };
      
      Object.entries(apiFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const url = params.toString() 
      ? `${API_BASE}/expenses?${params.toString()}`
      : `${API_BASE}/expenses`;

    const response = await apiRequest<ListExpensesResponse>(url);
    
    // 處理 API 錯誤
    if (response.error) {
      throw new Error(response.error);
    }
    
    // 轉換為前端期望的格式（含分頁模擬）
    const enhancedExpenses = response.expenses.map(enhanceExpenseWithPetName);
    return createMockPaginationResponse(
      enhancedExpenses,
      filters?.page || 1,
      filters?.page_size || 20
    );
  },

  // 搜尋費用紀錄（已棄用，因為 API 不支援 keyword 搜尋）
  async search(keyword: string, filters?: Omit<ExpenseFilters, 'keyword'>): Promise<MockExpenseListResponse> {
    // 在 mock 模式下模擬搜尋，實際 API 不支援
    if (USE_MOCK_DATA) {
      const searchFilters = { ...filters, keyword };
      return this.list(searchFilters);
    } else {
      // 真實 API 不支援 keyword 搜尋，回退到普通列表
      return this.list(filters);
    }
  },

  // 依寵物 ID 查詢費用紀錄
  async getByPetId(petId: string, filters?: Omit<ExpenseFilters, 'pet_id'>): Promise<MockExpenseListResponse> {
    const petFilters = { ...filters, pet_id: petId };
    return this.list(petFilters);
  },

  // 依日期範圍查詢費用紀錄
  async getByDateRange(
    startDate: string, 
    endDate: string, 
    filters?: Omit<ExpenseFilters, 'start_date' | 'end_date'>
  ): Promise<MockExpenseListResponse> {
    const dateFilters = { 
      ...filters, 
      start_date: startDate, 
      end_date: endDate 
    };
    return this.list(dateFilters);
  },

  // 依分類查詢費用紀錄
  async getByCategory(category: string, filters?: Omit<ExpenseFilters, 'category'>): Promise<MockExpenseListResponse> {
    const categoryFilters = { ...filters, category };
    return this.list(categoryFilters);
  },

  // 取得費用摘要統計
  async getSummary(filters?: { pet_id?: string }): Promise<ExpenseStatistics> {
    if (USE_MOCK_DATA) {
      await delay(400);
      return {
        total_amount: 16650,
        total_count: 15,
        average_amount: 1110,
        categories: [
          { category: '醫療', amount: 9000, count: 4 },
          { category: '飼料', amount: 2330, count: 3 },
          { category: '美容', amount: 1150, count: 2 },
        ],
        monthly_summary: [
          { month: '2024-01', amount: 5570, count: 7 },
          { month: '2023-12', amount: 11080, count: 8 },
        ],
      };
    }

    const url = filters?.pet_id
      ? `${API_BASE}/expenses/summary?pet_id=${filters.pet_id}`
      : `${API_BASE}/expenses/summary`;

    const response = await apiRequest<ExpenseStatistics>(url);
    
    if (response.error) {
      throw new Error(JSON.stringify(response.error));
    }
    
    return response;
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