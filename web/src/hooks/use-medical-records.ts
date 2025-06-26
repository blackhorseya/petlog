import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { medicalRecordApi, medicalRecordQueryKeys } from '@/lib/api/medical-record';
import { 
  MedicalRecord, 
  MedicalRecordFormData, 
  MedicalRecordQueryParams,
  CreateMedicalRecordRequest 
} from '@/lib/types/medical-record';

// 獲取指定寵物的醫療記錄
export function useMedicalRecords(
  petId: string,
  params?: MedicalRecordQueryParams
) {
  return useQuery({
    queryKey: medicalRecordQueryKeys.list(petId, params),
    queryFn: () => medicalRecordApi.listMedicalRecords(petId, params),
    enabled: !!petId,
    staleTime: 5 * 60 * 1000, // 5 分鐘
  });
}

// 根據 ID 獲取醫療記錄
export function useMedicalRecord(id: string | undefined) {
  return useQuery({
    queryKey: medicalRecordQueryKeys.detail(id!),
    queryFn: () => medicalRecordApi.getMedicalRecordById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// 建立醫療記錄
export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MedicalRecordFormData) => {
      const createRequest: CreateMedicalRecordRequest = {
        pet_id: data.pet_id,
        type: data.type,
        description: data.description,
        date: data.date,
        next_due_date: data.next_due_date,
        dosage: data.dosage,
      };
      return medicalRecordApi.createMedicalRecord(createRequest);
    },
    onSuccess: (newRecord: MedicalRecord) => {
      // 無效化並重新獲取該寵物的醫療記錄列表
      queryClient.invalidateQueries({ 
        queryKey: medicalRecordQueryKeys.lists() 
      });
      
      // 將新醫療記錄添加到快取中
      queryClient.setQueryData(
        medicalRecordQueryKeys.detail(newRecord.id), 
        newRecord
      );
      
      toast.success('醫療記錄建立成功！');
    },
    onError: (error: Error) => {
      console.error('建立醫療記錄失敗:', error);
      toast.error(`建立醫療記錄失敗: ${error.message}`);
    },
  });
}

// 更新醫療記錄
export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MedicalRecordFormData }) =>
      medicalRecordApi.updateMedicalRecord(id, {
        type: data.type,
        description: data.description,
        date: data.date,
        next_due_date: data.next_due_date,
        dosage: data.dosage,
      }),
    onSuccess: (_, { id, data }) => {
      // 無效化相關查詢
      queryClient.invalidateQueries({ 
        queryKey: medicalRecordQueryKeys.lists() 
      });
      queryClient.invalidateQueries({ 
        queryKey: medicalRecordQueryKeys.detail(id) 
      });
      
      // 樂觀更新快取中的醫療記錄資料
      queryClient.setQueryData(
        medicalRecordQueryKeys.detail(id), 
        (old: MedicalRecord | undefined) => {
          if (!old) return old;
          return {
            ...old,
            ...data,
          };
        }
      );
      
      toast.success('醫療記錄更新成功！');
    },
    onError: (error: Error) => {
      console.error('更新醫療記錄失敗:', error);
      toast.error(`更新醫療記錄失敗: ${error.message}`);
    },
  });
}

// 刪除醫療記錄
export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => medicalRecordApi.deleteMedicalRecord(id),
    onSuccess: (_, deletedId) => {
      // 從快取中移除已刪除的醫療記錄
      queryClient.removeQueries({ 
        queryKey: medicalRecordQueryKeys.detail(deletedId) 
      });
      
      // 無效化醫療記錄列表
      queryClient.invalidateQueries({ 
        queryKey: medicalRecordQueryKeys.lists() 
      });
      
      toast.success('醫療記錄已成功刪除');
    },
    onError: (error: Error) => {
      console.error('刪除醫療記錄失敗:', error);
      toast.error(`刪除醫療記錄失敗: ${error.message}`);
    },
  });
}

// 樂觀更新：在 mutation 執行前立即更新 UI
export function useOptimisticMedicalRecordUpdate() {
  const queryClient = useQueryClient();

  const updateMedicalRecordOptimistically = (
    id: string, 
    updates: Partial<MedicalRecord>
  ) => {
    queryClient.setQueryData(
      medicalRecordQueryKeys.detail(id), 
      (old: MedicalRecord | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      }
    );
  };

  return { updateMedicalRecordOptimistically };
}