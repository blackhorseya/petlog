import type {
  Expense,
  ExpenseCategory,
  ListExpensesResponse,
  ExpenseSummary,
} from '@/lib/types/expense';
import { Pet } from '@/lib/types/pet';

// Mock 分類資料
export const mockCategories: ExpenseCategory[] = [
  { id: '1', name: '醫療', is_default: true },
  { id: '2', name: '飼料', is_default: true },
  { id: '3', name: '保健品', is_default: true },
  { id: '4', name: '日用品', is_default: true },
  { id: '5', name: '其他', is_default: true },
];

// Mock 費用資料（可變的，支援 CRUD 操作）
let mockExpensesData: Expense[] = [
  {
    id: '1',
    pet_id: 'pet1',
    pet_name: '小白',
    category: '醫療',
    amount: 1500,
    description: '定期健檢和疫苗接種',
    date: '2024-01-15',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    pet_id: 'pet1',
    pet_name: '小白',
    category: '飼料',
    amount: 800,
    description: '皇家幼犬飼料 3kg',
    date: '2024-01-12',
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-01-12T14:20:00Z',
  },
  {
    id: '4',
    pet_id: 'pet1',
    pet_name: '小白',
    category: '保健品',
    amount: 450,
    description: '關節保養品',
    date: '2024-01-08',
    created_at: '2024-01-08T09:15:00Z',
    updated_at: '2024-01-08T09:15:00Z',
  },
  {
    id: '5',
    pet_id: 'pet2',
    pet_name: '黑豆',
    category: '醫療',
    amount: 2200,
    description: '牙科治療',
    date: '2024-01-05',
    created_at: '2024-01-05T11:00:00Z',
    updated_at: '2024-01-05T11:00:00Z',
  },
  {
    id: '6',
    pet_id: 'pet1',
    pet_name: '小白',
    category: '日用品',
    amount: 320,
    description: '玩具和零食',
    date: '2024-01-03',
    created_at: '2024-01-03T13:30:00Z',
    updated_at: '2024-01-03T13:30:00Z',
  },
  {
    id: '7',
    pet_id: 'pet3',
    pet_name: '咪咪',
    category: '飼料',
    amount: 680,
    description: '貓糧和罐頭',
    date: '2024-01-01',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T08:00:00Z',
  },
  {
    id: '9',
    pet_id: 'pet1',
    pet_name: '小白',
    category: '醫療',
    amount: 3500,
    description: '緊急手術治療',
    date: '2023-12-25',
    created_at: '2023-12-25T18:20:00Z',
    updated_at: '2023-12-25T18:20:00Z',
  },
  {
    id: '10',
    pet_id: 'pet3',
    pet_name: '咪咪',
    category: '其他',
    amount: 1200,
    description: '寵物保險費用',
    date: '2023-12-20',
    created_at: '2023-12-20T10:00:00Z',
    updated_at: '2023-12-20T10:00:00Z',
  },
  {
    id: '11',
    pet_id: 'pet1',
    pet_name: '小白',
    category: '日用品',
    amount: 280,
    description: '新的項圈和牽繩',
    date: '2023-12-18',
    created_at: '2023-12-18T12:30:00Z',
    updated_at: '2023-12-18T12:30:00Z',
  },
  {
    id: '12',
    pet_id: 'pet2',
    pet_name: '黑豆',
    category: '保健品',
    amount: 720,
    description: '眼部護理用品',
    date: '2023-12-15',
    created_at: '2023-12-15T14:45:00Z',
    updated_at: '2023-12-15T14:45:00Z',
  },
  {
    id: '13',
    pet_id: 'pet3',
    pet_name: '咪咪',
    category: '醫療',
    amount: 1800,
    description: '年度健康檢查',
    date: '2023-12-12',
    created_at: '2023-12-12T09:30:00Z',
    updated_at: '2023-12-12T09:30:00Z',
  },
  {
    id: '15',
    pet_id: 'pet2',
    pet_name: '黑豆',
    category: '飼料',
    amount: 850,
    description: '高級狗糧',
    date: '2023-12-08',
    created_at: '2023-12-08T11:15:00Z',
    updated_at: '2023-12-08T11:15:00Z',
  },
];

// Mock 統計資料
export const mockStatistics: ExpenseSummary = {
  total_amount: 12500, // 重新計算
  category_stats: {
    '醫療': 7500,
    '飼料': 1650,
    '保健品': 1170,
    '日用品': 600,
    '其他': 1200,
  },
  recent: [], // 暫時留空
};

// 模擬 API 延遲
export const delay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

// 模擬錯誤（10% 機率）
export const shouldSimulateError = () => Math.random() < 0.1;

// 模擬篩選邏輯（支援 ExpenseWithPetName）
export function filterExpenses<T extends Expense>(
  expenses: T[], 
  filters: {
    pet_id?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
    keyword?: string;
  }
): T[] {
  return expenses.filter(expense => {
    if (filters.pet_id && expense.pet_id !== filters.pet_id) return false;
    if (filters.category && expense.category !== filters.category) return false;
    if (filters.start_date && new Date(expense.date) < new Date(filters.start_date)) return false;
    if (filters.end_date && new Date(expense.date) > new Date(filters.end_date)) return false;
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      const petName = expense.pet_name || ''; // 提供 fallback
      if (
        !expense.category.toLowerCase().includes(keyword) &&
        !(expense.description && expense.description.toLowerCase().includes(keyword)) &&
        !petName.toLowerCase().includes(keyword)
      ) {
        return false;
      }
    }
    return true;
  });
}

// 模擬分頁邏輯
export function paginateExpenses(
  expenses: Expense[], 
  page: number = 1, 
  pageSize: number = 20
): ListExpensesResponse {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedExpenses = expenses.slice(startIndex, endIndex);
  
  return {
    expenses: paginatedExpenses,
  };
}

// 獲取當前的費用資料（用於讀取操作）
export function getMockExpenses(): Expense[] {
  return [...mockExpensesData];
}

// 新增費用（模擬 create）
export function addMockExpense(expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Expense {
  const now = new Date().toISOString();
  const newId = String(Math.max(...mockExpensesData.map(e => parseInt(e.id))) + 1);
  
  const newExpense: Expense = {
    ...expenseData,
    id: newId,
    created_at: now,
    updated_at: now,
  };
  
  mockExpensesData.unshift(newExpense); // 添加到開頭（最新的在前面）
  return newExpense;
}

// 更新費用（模擬 update）
export function updateMockExpense(id: string, updateData: Partial<Omit<Expense, 'id' | 'created_at'>>): Expense {
  const index = mockExpensesData.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('找不到指定的費用紀錄');
  }
  
  const updatedExpense: Expense = {
    ...mockExpensesData[index],
    ...updateData,
    updated_at: new Date().toISOString(),
  };
  
  mockExpensesData[index] = updatedExpense;
  return updatedExpense;
}

// 刪除費用（模擬 delete）
export function deleteMockExpense(id: string): void {
  const index = mockExpensesData.findIndex(e => e.id === id);
  if (index === -1) {
    throw new Error('找不到指定的費用紀錄');
  }
  
  mockExpensesData.splice(index, 1);
}

// 重置為原始資料（用於測試）
export function resetMockExpenses(): void {
  mockExpensesData = [...mockExpensesData];
}

// 分類管理相關函數
let mockCategoriesData = [...mockCategories];

export function getMockCategories(): ExpenseCategory[] {
  return [...mockCategoriesData];
}

export function addMockCategory(name: string): ExpenseCategory {
  const newId = String(Math.max(...mockCategoriesData.map(c => parseInt(c.id))) + 1);
  const newCategory: ExpenseCategory = {
    id: newId,
    name,
    user_id: 'user1',
    is_default: false,
  };
  
  mockCategoriesData.push(newCategory);
  return newCategory;
}

export function updateMockCategory(id: string, name: string): ExpenseCategory {
  const index = mockCategoriesData.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('找不到指定的分類');
  }
  
  const updatedCategory: ExpenseCategory = {
    ...mockCategoriesData[index],
    name,
  };
  
  mockCategoriesData[index] = updatedCategory;
  return updatedCategory;
}

export function deleteMockCategory(id: string): void {
  const index = mockCategoriesData.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('找不到指定的分類');
  }
  
  // 不允許刪除預設分類
  if (mockCategoriesData[index].is_default) {
    throw new Error('無法刪除預設分類');
  }
  
  mockCategoriesData.splice(index, 1);
}

// 模擬 API 操作
export const expenseMockAPI = {
  // ... 這裡的實作保持不變，因為 categoryAPI 仍在使用它
};