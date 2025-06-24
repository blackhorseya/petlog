import { useQuery } from '@tanstack/react-query';
import { dashboardApi, dashboardQueryKeys } from '@/lib/api/dashboard';

// 獲取首頁概覽
export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardQueryKeys.overview(),
    queryFn: () => dashboardApi.getDashboardOverview(),
    staleTime: 5 * 60 * 1000, // 5 分鐘
    refetchOnWindowFocus: false, // 防止過度重新整理
  });
}