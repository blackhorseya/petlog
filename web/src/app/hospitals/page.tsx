"use client";

import * as React from "react";
import { Building2 } from "lucide-react";

import { HospitalSearch } from "@/components/hospitals/hospital-search";
import { HospitalCard } from "@/components/hospitals/hospital-card";
import { hospitalApi } from "@/lib/api/hospital";
import {
  Hospital,
  SearchHospitalsParams,
  SearchHospitalsResponse
} from "@/lib/types/hospital";

export default function HospitalsPage() {
  const [searchResponse, setSearchResponse] = React.useState<SearchHospitalsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSearch = React.useCallback(async (params: SearchHospitalsParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await hospitalApi.searchHospitals(params);
      setSearchResponse(response);
    } catch (err) {
      console.error("搜尋醫院失敗:", err);
      setError(err instanceof Error ? err.message : "搜尋失敗");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleViewDetail = (hospital: Hospital) => {
    console.log("查看醫院詳情:", hospital);
    // TODO: 導航到醫院詳情頁面
  };

  const handleNavigate = (hospital: Hospital) => {
    const { latitude, longitude } = hospital.coordinates;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(googleMapsUrl, "_blank");
  };

  // 頁面載入時執行預設搜尋
  React.useEffect(() => {
    handleSearch({});
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 頁面標題 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          <h1 className="text-3xl font-bold">醫院搜尋</h1>
        </div>
        <p className="text-muted-foreground">
          搜尋附近的動物醫院，找到最適合您寵物的醫療照護
        </p>
      </div>

      {/* 搜尋元件 */}
      <HospitalSearch onSearch={handleSearch} isLoading={isLoading} />

      {/* 搜尋結果 */}
      <div className="space-y-4">
        {/* 結果統計 */}
        {searchResponse && !isLoading && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              找到 {searchResponse.total} 間醫院
              {searchResponse.hospitals.length > 0 && (
                <>
                  ，顯示第 {(searchResponse.page - 1) * searchResponse.limit + 1} - {Math.min(searchResponse.page * searchResponse.limit, searchResponse.total)} 項
                </>
              )}
            </div>
            {searchResponse.stats && (
              <div className="text-sm text-muted-foreground">
                頁面 {searchResponse.page} / {Math.ceil(searchResponse.total / searchResponse.limit)}
              </div>
            )}
          </div>
        )}

        {/* 載入狀態 */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {/* 錯誤狀態 */}
        {error && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-destructive">
              載入醫院資料失敗
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => handleSearch({})}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              重新載入
            </button>
          </div>
        )}

        {/* 空狀態 */}
        {searchResponse && searchResponse.hospitals.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">沒有找到醫院</h3>
            <p className="text-muted-foreground mb-4">
              請嘗試調整搜尋條件或擴大搜尋範圍
            </p>
          </div>
        )}

        {/* 醫院列表 */}
        {searchResponse && searchResponse.hospitals.length > 0 && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResponse.hospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                onViewDetail={handleViewDetail}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}