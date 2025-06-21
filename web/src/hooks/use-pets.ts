import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { petApi, petQueryKeys } from '@/lib/api/pet';
import { Pet, CreatePetRequest, PetFormData } from '@/lib/types/pet';

// 獲取所有寵物
export function usePets() {
  return useQuery({
    queryKey: petQueryKeys.lists(),
    queryFn: () => petApi.listPets(),
    staleTime: 5 * 60 * 1000, // 5 分鐘
  });
}

// 根據 ID 獲取寵物
export function usePet(id: string | undefined) {
  return useQuery({
    queryKey: petQueryKeys.detail(id!),
    queryFn: () => petApi.getPetById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// 建立寵物
export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PetFormData) => {
      const createRequest: CreatePetRequest = {
        name: data.name,
        avatar_url: data.avatar_url,
      };
      return petApi.createPet(createRequest);
    },
    onSuccess: (newPet: Pet) => {
      // 無效化並重新獲取寵物列表
      queryClient.invalidateQueries({ queryKey: petQueryKeys.lists() });
      
      // 將新寵物添加到快取中
      queryClient.setQueryData(petQueryKeys.detail(newPet.id), newPet);
      
      toast.success('寵物建立成功！');
    },
    onError: (error: Error) => {
      console.error('建立寵物失敗:', error);
      toast.error(`建立寵物失敗: ${error.message}`);
    },
  });
}

// 更新寵物
export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PetFormData }) =>
      petApi.updatePet(id, {
        name: data.name,
        avatar_url: data.avatar_url,
      }),
    onSuccess: (_, { id, data }) => {
      // 無效化相關查詢
      queryClient.invalidateQueries({ queryKey: petQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: petQueryKeys.detail(id) });
      
      // 樂觀更新快取中的寵物資料
      queryClient.setQueryData(petQueryKeys.detail(id), (old: Pet | undefined) => {
        if (!old) return old;
        return {
          ...old,
          name: data.name,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        };
      });
      
      toast.success('寵物資料更新成功！');
    },
    onError: (error: Error) => {
      console.error('更新寵物失敗:', error);
      toast.error(`更新寵物失敗: ${error.message}`);
    },
  });
}

// 刪除寵物
export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => petApi.deletePet(id),
    onSuccess: (_, deletedId) => {
      // 從快取中移除已刪除的寵物
      queryClient.removeQueries({ queryKey: petQueryKeys.detail(deletedId) });
      
      // 無效化寵物列表
      queryClient.invalidateQueries({ queryKey: petQueryKeys.lists() });
      
      toast.success('寵物已成功刪除');
    },
    onError: (error: Error) => {
      console.error('刪除寵物失敗:', error);
      toast.error(`刪除寵物失敗: ${error.message}`);
    },
  });
}

// 樂觀更新：在 mutation 執行前立即更新 UI
export function useOptimisticPetUpdate() {
  const queryClient = useQueryClient();

  const updatePetOptimistically = (id: string, updates: Partial<Pet>) => {
    queryClient.setQueryData(petQueryKeys.detail(id), (old: Pet | undefined) => {
      if (!old) return old;
      return { ...old, ...updates };
    });
  };

  return { updatePetOptimistically };
}