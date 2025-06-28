"use client";

import { useState, useEffect } from "react";
import {
  listMedicalRecordsByPet,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from "@/lib/api/medical-record";
import type {
  MedicalRecord,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  ListMedicalRecordsParams,
  MedicalRecordFormData,
} from "@/lib/types/medical-record";

// 列出醫療紀錄的 hook
export function useMedicalRecords(params: ListMedicalRecordsParams) {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(!!params.pet_id); // 只有當有 pet_id 時才初始為 loading
  const [error, setError] = useState<string | null>(null);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const records = await listMedicalRecordsByPet(params);
      setMedicalRecords(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "載入醫療紀錄失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.pet_id) {
      fetchMedicalRecords();
    } else {
      // 如果沒有 pet_id，重置狀態
      setMedicalRecords([]);
      setLoading(false);
      setError(null);
    }
  }, [params.pet_id, params.start_date, params.end_date]);

  const refresh = () => {
    fetchMedicalRecords();
  };

  return {
    medicalRecords,
    loading,
    error,
    refresh,
  };
}

// 單筆醫療紀錄的 hook
export function useMedicalRecord(id: string | null) {
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicalRecord = async (recordId: string) => {
    try {
      setLoading(true);
      setError(null);
      const record = await getMedicalRecordById(recordId);
      setMedicalRecord(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : "載入醫療紀錄失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMedicalRecord(id);
    } else {
      setMedicalRecord(null);
    }
  }, [id]);

  return {
    medicalRecord,
    loading,
    error,
    refresh: () => id && fetchMedicalRecord(id),
  };
}

// 建立醫療紀錄的 hook
export function useCreateMedicalRecord() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: MedicalRecordFormData): Promise<MedicalRecord> => {
    try {
      setLoading(true);
      setError(null);
      
      // 轉換表單資料為 API 請求格式
      const requestData: CreateMedicalRecordRequest = {
        pet_id: data.pet_id,
        type: data.type,
        description: data.description,
        date: data.date,
        next_due_date: data.next_due_date || undefined,
        dosage: data.dosage || undefined,
      };

      const newRecord = await createMedicalRecord(requestData);
      return newRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "建立醫療紀錄失敗";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    loading,
    error,
  };
}

// 更新醫療紀錄的 hook
export function useUpdateMedicalRecord() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (
    id: string,
    data: MedicalRecordFormData
  ): Promise<MedicalRecord> => {
    try {
      setLoading(true);
      setError(null);

      // 轉換表單資料為 API 請求格式 (排除 id 因為它會在 API 函式中加入)
      const requestData: Omit<UpdateMedicalRecordRequest, "id"> = {
        pet_id: data.pet_id,
        type: data.type,
        description: data.description,
        date: data.date,
        next_due_date: data.next_due_date || undefined,
        dosage: data.dosage || undefined,
      };

      const updatedRecord = await updateMedicalRecord(id, requestData);
      return updatedRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新醫療紀錄失敗";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    update,
    loading,
    error,
  };
}

// 刪除醫療紀錄的 hook
export function useDeleteMedicalRecord() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await deleteMedicalRecord(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "刪除醫療紀錄失敗";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    remove,
    loading,
    error,
  };
}

// 綜合管理 hook
export function useMedicalRecordManager(petId: string) {
  const { medicalRecords, loading: listLoading, error: listError, refresh } = useMedicalRecords({ pet_id: petId || "" });
  const { create, loading: createLoading, error: createError } = useCreateMedicalRecord();
  const { update, loading: updateLoading, error: updateError } = useUpdateMedicalRecord();
  const { remove, loading: deleteLoading, error: deleteError } = useDeleteMedicalRecord();

  const handleCreate = async (data: MedicalRecordFormData) => {
    const newRecord = await create(data);
    refresh(); // 重新載入列表
    return newRecord;
  };

  const handleUpdate = async (id: string, data: MedicalRecordFormData) => {
    const updatedRecord = await update(id, data);
    refresh(); // 重新載入列表
    return updatedRecord;
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    refresh(); // 重新載入列表
  };

  return {
    medicalRecords,
    loading: listLoading || createLoading || updateLoading || deleteLoading,
    error: listError || createError || updateError || deleteError,
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
    refresh,
  };
}