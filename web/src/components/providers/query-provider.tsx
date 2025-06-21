"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5 分鐘的 stale time
            staleTime: 1000 * 60 * 5,
            // 在窗口重新聚焦時重新獲取
            refetchOnWindowFocus: false,
            // 錯誤重試配置
            retry: (failureCount, error) => {
              // 對於 4xx 錯誤不進行重試
              if (error instanceof Error && error.message.includes('4')) {
                return false;
              }
              // 最多重試 3 次
              return failureCount < 3;
            },
          },
          mutations: {
            // mutation 錯誤重試配置
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 開發環境顯示 React Query 開發工具 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}