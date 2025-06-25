import { useQuery } from '@tanstack/react-query';
import { listHealthLogsByPet } from '@/lib/api/health-log';
import { HealthLog } from '@/lib/types/health-log';

interface UseHealthLogsOptions {
  petId?: string;
  startDate?: string;
  endDate?: string;
}

export function useHealthLogs(options: UseHealthLogsOptions = {}) {
  const { petId, startDate, endDate } = options;
  
  return useQuery<{ health_logs: HealthLog[] }, Error>({
    queryKey: ['health-logs', petId, startDate, endDate],
    queryFn: async () => {
      // 若未指定 petId，直接回傳空陣列
      if (!petId || petId.trim() === '') {
        return { health_logs: [] };
      }
      const result = await listHealthLogsByPet({
        pet_id: petId,
        start_date: startDate,
        end_date: endDate,
      });
      return result;
    },
    enabled: !!petId && petId.trim() !== '', // 確保 petId 有效才執行查詢
    staleTime: 2 * 60 * 1000, // 2 分鐘快取
    retry: (failureCount, error) => {
      return failureCount < 3; // 最多重試 3 次
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // 指數退避
  });
} 