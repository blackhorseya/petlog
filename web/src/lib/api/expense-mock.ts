import type {
  Expense,
  ExpenseCategory,
  ExpenseListResponse,
  ExpenseStatistics,
} from '@/lib/types/expense';

// 簡單的寵物類型定義（用於費用篩選）
export interface MockPet {
  id: string;
  name: string;
  breed?: string;
  dob?: string;
}

// Mock 寵物資料（用於費用篩選器）
export const mockPets: MockPet[] = [
  {
    id: 'pet1',
    name: '小白',
    breed: '黃金獵犬',
    dob: '2020-03-15',
  },
  {
    id: 'pet2',
    name: '黑豆',
    breed: '邊境牧羊犬',
    dob: '2019-07-22',
  },
  {
    id: 'pet3',
    name: '咪咪',
    breed: '英國短毛貓',
    dob: '2021-11-08',
  },
];

// Mock 分類資料
export const mockCategories: ExpenseCategory[] = [
  { id: '1', name: '醫療', is_default: true },
  { id: '2', name: '飼料', is_default: true },
  { id: '3', name: '保健品', is_default: true },
  { id: '4', name: '日用品', is_default: true },
  { id: '5', name: '其他', is_default: true },
  { id: '6', name: '美容', is_default: false, user_id: 'user1' },
  { id: '7', name: '訓練', is_default: false, user_id: 'user1' },
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
    id: '3',
    pet_id: 'pet2',
    pet_name: '黑豆',
    category: '美容',
    amount: 600,
    description: '洗澡和剪毛',
    date: '2024-01-10',
    created_at: '2024-01-10T16:45:00Z',
    updated_at: '2024-01-10T16:45:00Z',
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
    id: '8',
    pet_id: 'pet2',
    pet_name: '黑豆',
    category: '訓練',
    amount: 1000,
    description: '基礎服從訓練課程',
    date: '2023-12-28',
    created_at: '2023-12-28T15:00:00Z',
    updated_at: '2023-12-28T15:00:00Z',
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
    id: '14',
    pet_id: 'pet1',
    pet_name: '小白',
    category: '美容',
    amount: 550,
    description: '專業美容護理',
    date: '2023-12-10',
    created_at: '2023-12-10T16:00:00Z',
    updated_at: '2023-12-10T16:00:00Z',
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
export const mockStatistics: ExpenseStatistics = {
  total_amount: 16650,
  total_count: 15,
  average_amount: 1110,
  categories: [
    { category: '醫療', amount: 9000, count: 4 },
    { category: '飼料', amount: 2330, count: 3 },
    { category: '美容', amount: 1150, count: 2 },
    { category: '保健品', amount: 1170, count: 2 },
    { category: '日用品', amount: 600, count: 2 },
    { category: '訓練', amount: 1000, count: 1 },
    { category: '其他', amount: 1200, count: 1 },
  ],
  monthly_summary: [
    { month: '2024-01', amount: 5570, count: 7 },
    { month: '2023-12', amount: 11080, count: 8 },
  ],
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
    // 寵物篩選
    if (filters.pet_id && expense.pet_id !== filters.pet_id) {
      return false;
    }

    // 分類篩選
    if (filters.category && expense.category !== filters.category) {
      return false;
    }

    // 日期範圍篩選
    if (filters.start_date && expense.date < filters.start_date) {
      return false;
    }
    if (filters.end_date && expense.date > filters.end_date) {
      return false;
    }

    // 關鍵字搜尋
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      return expense.description?.toLowerCase().includes(keyword) ||
             expense.category.toLowerCase().includes(keyword) ||
             expense.pet_name.toLowerCase().includes(keyword);
    }

    return true;
  });
}

// 模擬分頁邏輯
export function paginateExpenses(
  expenses: Expense[], 
  page: number = 1, 
  pageSize: number = 20
): ExpenseListResponse {
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