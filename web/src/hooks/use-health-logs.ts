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
      // 若未指定 petId，暫時回傳空陣列（未來可改為支援全部）
      if (!petId) return { health_logs: [] };
      return listHealthLogsByPet({
        pet_id: petId,
        start_date: startDate,
        end_date: endDate,
      });
    },
    enabled: !!petId, // 必須有 petId 才會發起查詢
    staleTime: 2 * 60 * 1000,
  });
} 