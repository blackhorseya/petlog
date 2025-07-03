import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseAPI, categoryAPI } from '@/lib/api/expense';
import type {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilters,
  ExpenseCategory,
  ExpenseSummary,
} from '@/lib/types/expense';

// Query Keys
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters?: ExpenseFilters) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  summary: (filters?: { pet_id?: string }) => 
    [...expenseKeys.all, 'summary', filters] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (type?: 'default' | 'custom' | 'all') => [...categoryKeys.lists(), type] as const,
};

// 費用紀錄 Hooks
export function useExpenses(filters: ExpenseFilters = {}) {
  const { page = 1, limit = 10, ...apiFilters } = filters;

  return useQuery({
    queryKey: expenseKeys.list(apiFilters),
    queryFn: () => expenseAPI.list(apiFilters),
    select: (data) => {
      const allExpenses = data.expenses || [];

      return {
        expenses: allExpenses,
        total: allExpenses.length,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 分鐘
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expenseAPI.getById(id),
    enabled: !!id,
    select: (data) => data.expense,
  });
}

export function useExpenseSummary(filters?: { pet_id?: string }) {
  return useQuery({
    queryKey: expenseKeys.summary(filters),
    queryFn: () => expenseAPI.summary(filters),
    staleTime: 1000 * 60 * 10, // 10 分鐘
  });
}

// 建立費用紀錄
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => expenseAPI.create(data),
    onSuccess: () => {
      // 清除相關快取
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

// 更新費用紀錄
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateExpenseRequest) => 
      expenseAPI.update(data.id, data),
    onSuccess: (response) => {
      const updatedExpense = response.expense;
      // 更新特定項目快取
      queryClient.setQueryData(
        expenseKeys.detail(updatedExpense.id),
        updatedExpense
      );
      // 清除列表快取
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

// 刪除費用紀錄
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseAPI.delete(id),
    onSuccess: (_, deletedId) => {
      // 移除特定項目快取
      queryClient.removeQueries({ queryKey: expenseKeys.detail(deletedId) });
      // 清除列表快取
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

// 分類相關 Hooks
export function useCategories(type: 'default' | 'custom' | 'all' = 'all') {
  return useQuery({
    queryKey: categoryKeys.list(type),
    queryFn: () => {
      switch (type) {
        case 'default':
          return categoryAPI.getDefaults();
        case 'custom':
          return categoryAPI.getUserCategories();
        default:
          return categoryAPI.getAll();
      }
    },
    staleTime: 1000 * 60 * 10, // 10 分鐘
  });
}

// 建立分類
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => categoryAPI.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

// 更新分類
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      categoryAPI.update(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

// 刪除分類
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

// 複合 Hook：費用紀錄管理
export function useExpenseManagement() {
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}