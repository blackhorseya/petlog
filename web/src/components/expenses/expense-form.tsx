"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  Calendar, 
  DollarSign, 
  Plus, 
  X,
  Save,
  ArrowLeft,
  Tag,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePets } from "@/hooks/use-pets";
import { useCategories, useCreateCategory, useExpenseManagement } from "@/hooks/use-expenses";
import type { CreateExpenseRequest, UpdateExpenseRequest, Expense } from "@/lib/types/expense";

// 表單驗證 schema
const expenseFormSchema = z.object({
  pet_id: z.string().min(1, "請選擇寵物"),
  category: z.string().min(1, "請選擇分類"),
  amount: z.coerce.number().int().min(1, "金額必須為正整數"),
  description: z.string().optional(),
  date: z.string().min(1, "請選擇日期"),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  initialData?: Expense;
  onCancel?: () => void;
  onSuccess?: () => void;
}

// 快速輸入數據的 localStorage keys
const STORAGE_KEYS = {
  lastCategory: 'expense-form-last-category',
  lastAmount: 'expense-form-last-amount',
  lastPetId: 'expense-form-last-pet-id',
};

export function ExpenseForm({ 
  initialData, 
  onCancel, 
  onSuccess,
}: ExpenseFormProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showQuickFill, setShowQuickFill] = useState(false);

  const isEditing = !!initialData;

  // Hooks
  const { data: pets, isLoading: petsLoading } = usePets();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { mutate: createCategory, isPending: isCreatingCategory } = useCreateCategory();
  const { create, update, isCreating, isUpdating, isLoading } = useExpenseManagement();

  // 表單初始化
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      pet_id: initialData?.pet_id || "",
      category: initialData?.category || "",
      amount: initialData?.amount || 0,
      description: initialData?.description || "",
      date: initialData?.date || new Date().toISOString().split('T')[0],
    },
    mode: "onChange",
  });

  const watchedAmount = watch("amount");
  const watchedCategory = watch("category");
  const watchedPetId = watch("pet_id");

  // 載入快速輸入數據
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialData) {
      const lastCategory = localStorage.getItem(STORAGE_KEYS.lastCategory);
      const lastAmount = localStorage.getItem(STORAGE_KEYS.lastAmount);
      const lastPetId = localStorage.getItem(STORAGE_KEYS.lastPetId);

      if (lastCategory || lastAmount || lastPetId) {
        setShowQuickFill(true);
      }
    }
  }, [initialData]);

  // 快速填入功能
  const handleQuickFill = () => {
    if (typeof window !== 'undefined') {
      const lastCategory = localStorage.getItem(STORAGE_KEYS.lastCategory);
      const lastAmount = localStorage.getItem(STORAGE_KEYS.lastAmount);
      const lastPetId = localStorage.getItem(STORAGE_KEYS.lastPetId);

      if (lastCategory) setValue("category", lastCategory);
      if (lastAmount) setValue("amount", parseInt(lastAmount));
      if (lastPetId) setValue("pet_id", lastPetId);
    }
    setShowQuickFill(false);
  };

  // 保存快速輸入數據
  const saveQuickInputData = (data: ExpenseFormData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.lastCategory, data.category);
      localStorage.setItem(STORAGE_KEYS.lastAmount, data.amount.toString());
      localStorage.setItem(STORAGE_KEYS.lastPetId, data.pet_id);
    }
  };

  // 新增分類處理
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("請輸入分類名稱");
      return;
    }

    createCategory(newCategoryName.trim(), {
      onSuccess: (newCategory) => {
        setValue("category", newCategory.name);
        setNewCategoryName("");
        setIsAddingCategory(false);
        toast.success("分類新增成功");
      },
      onError: (error) => {
        toast.error(`新增分類失敗: ${error.message}`);
      },
    });
  };

  // 表單提交處理
  const onFormSubmit = (data: ExpenseFormData) => {
    // 保存快速輸入數據
    saveQuickInputData(data);

    if (isEditing) {
      const submitData: UpdateExpenseRequest = {
        id: initialData.id,
        pet_id: data.pet_id,
        category: data.category,
        amount: data.amount,
        description: data.description || "",
        date: new Date(data.date).toISOString(),
      };
      update(submitData, {
        onSuccess: () => {
          toast.success("費用記錄更新成功");
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          toast.error(`更新失敗: ${error.message}`);
        },
      });
    } else {
      const submitData: CreateExpenseRequest = {
        pet_id: data.pet_id,
        category: data.category,
        amount: data.amount,
        description: data.description || "",
        date: new Date(data.date).toISOString(),
      };
      create(submitData, {
        onSuccess: () => {
          toast.success("費用記錄新增成功");
          reset();
          // 重新設定預設值
          setValue("date", new Date().toISOString().split('T')[0]);
          setValue("amount", 0);
          setValue("description", "");
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          toast.error(`新增失敗: ${error.message}`);
        },
      });
    }
  };

  const isSubmitting = isLoading;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <DollarSign className="h-6 w-6" />
          {isEditing ? "編輯費用記錄" : "新增費用記錄"}
        </CardTitle>
        
        {/* 快速填入提示 */}
        {showQuickFill && !isEditing && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">發現上次輸入的資料，要快速填入嗎？</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleQuickFill}
                className="text-blue-600 hover:text-blue-800"
              >
                填入
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowQuickFill(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* 寵物選擇器 */}
          <div className="space-y-2">
            <Label htmlFor="pet_id">寵物 *</Label>
            <Select 
              value={watchedPetId} 
              onValueChange={(value: string) => setValue("pet_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="請選擇寵物" />
              </SelectTrigger>
              <SelectContent>
                {petsLoading ? (
                  <div className="p-2 text-sm text-center text-gray-500">載入中...</div>
                ) : pets?.length ? (
                  pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-center text-gray-500">沒有可用的寵物</div>
                )}
              </SelectContent>
            </Select>
            {errors.pet_id && (
              <p className="text-sm text-red-500">{errors.pet_id.message}</p>
            )}
          </div>

          {/* 分類選擇器 */}
          <div className="space-y-2">
            <Label htmlFor="category">分類 *</Label>
            <div className="flex gap-2">
                             <Select 
                 value={watchedCategory} 
                 onValueChange={(value: string) => setValue("category", value)}
               >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="請選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesLoading ? (
                    <div className="p-2 text-sm text-center text-gray-500">載入中...</div>
                  ) : categories?.length ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          <span>{category.name}</span>
                          {category.is_default && (
                            <span className="text-xs text-gray-500">(預設)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-center text-gray-500">沒有可用的分類</div>
                  )}
                </SelectContent>
              </Select>
              
              {/* 新增分類按鈕 */}
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => setIsAddingCategory(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              {/* 新增分類對話框 */}
              <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>新增分類</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newCategory">分類名稱</Label>
                      <Input
                        id="newCategory"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="例如：美容、訓練"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCategory();
                          }
                        }}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddingCategory(false);
                          setNewCategoryName("");
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={isCreatingCategory || !newCategoryName.trim()}
                      >
                        {isCreatingCategory ? "新增中..." : "新增"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* 金額輸入框 */}
          <div className="space-y-2">
            <Label htmlFor="amount">金額 (元) *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="1"
              placeholder="請輸入金額"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* 描述輸入框 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述 (選填)</Label>
            <Textarea
              id="description"
              placeholder="例如：疫苗接種、洗牙治療"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* 日期選擇器 */}
          <div className="space-y-2">
            <Label htmlFor="date">日期 *</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                取消
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isEditing ? "更新中..." : "新增中..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isEditing ? "更新費用" : "新增費用"}
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}