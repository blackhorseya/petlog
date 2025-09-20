"use client";

import * as React from "react";
import { Building2, Map, List, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

import { HospitalSearch } from "@/components/hospitals/hospital-search";
import { HospitalCard } from "@/components/hospitals/hospital-card";
import { HospitalPagination } from "@/components/hospitals/hospital-pagination";
import { HospitalMap } from "@/components/hospitals/hospital-map";
import { hospitalApi } from "@/lib/api/hospital";
import {
  Hospital,
  SearchHospitalsParams,
  SearchHospitalsResponse,
  DEFAULT_SEARCH_PARAMS
} from "@/lib/types/hospital";

type ViewMode = "list" | "map";

export default function HospitalsPage() {
  const [searchResponse, setSearchResponse] = React.useState<SearchHospitalsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentParams, setCurrentParams] = React.useState<SearchHospitalsParams>({});
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [requestLocation, setRequestLocation] = React.useState(false);

  const handleSearch = React.useCallback(async (params: SearchHospitalsParams) => {
    setIsLoading(true);
    setError(null);
    setCurrentParams(params);

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

  const handlePageChange = React.useCallback((page: number) => {
    const newParams = { ...currentParams, page };
    handleSearch(newParams);
  }, [currentParams, handleSearch]);

  const handlePageSizeChange = React.useCallback((limit: number) => {
    const newParams = { ...currentParams, page: 1, limit };
    handleSearch(newParams);
  }, [currentParams, handleSearch]);

  const handleViewDetail = (hospital: Hospital) => {
    console.log("查看醫院詳情:", hospital);
    // TODO: 導航到醫院詳情頁面
  };

  const handleNavigate = (hospital: Hospital) => {
    const { latitude, longitude } = hospital.coordinates;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(googleMapsUrl, "_blank");
  };

  const handleLocationFound = React.useCallback((location: { lat: number; lng: number }) => {
    setUserLocation(location);
    setRequestLocation(false); // 重置請求狀態
  }, []);

  const handleLocationError = React.useCallback((error: string) => {
    console.error("定位錯誤:", error);
    setLocationError(error);
    setRequestLocation(false); // 重置請求狀態
    // 3秒後清除錯誤訊息
    setTimeout(() => setLocationError(null), 3000);
  }, []);

  // 頁面載入時執行預設搜尋
  React.useEffect(() => {
    handleSearch(DEFAULT_SEARCH_PARAMS);
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

      {/* 位置錯誤提示 */}
      {locationError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800">定位服務提示</h4>
              <p className="text-sm text-yellow-700 mt-1 mb-2">
                {locationError}
              </p>
              <details className="text-xs text-yellow-600">
                <summary className="cursor-pointer hover:text-yellow-800">解決方法</summary>
                <div className="mt-2 space-y-1">
                  <p>• 確保您在戶外或窗邊，GPS 訊號較佳的位置</p>
                  <p>• iPhone 用戶：設定 → 隱私權與安全性 → 定位服務 → Safari → 允許 + 精確位置</p>
                  <p>• 確保網站使用 HTTPS 連線</p>
                  <p>• 您也可以手動在地圖上搜尋或移動到想要的位置</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}

      {/* 檢視模式切換 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            disabled={isLoading}
          >
            <List className="mr-2 h-4 w-4" />
            列表檢視
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
            disabled={isLoading}
          >
            <Map className="mr-2 h-4 w-4" />
            地圖檢視
          </Button>
        </div>

        {viewMode === "map" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // 清除位置錯誤和當前位置
              setLocationError(null);
              setUserLocation(null);
              // 觸發位置請求
              setRequestLocation(true);
            }}
            disabled={isLoading || requestLocation}
          >
            <MapPin className="mr-2 h-4 w-4" />
            {requestLocation ? "定位中..." : "我的位置"}
          </Button>
        )}
      </div>

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

        {/* 醫院內容 - 根據檢視模式顯示 */}
        {searchResponse && searchResponse.hospitals.length > 0 && !isLoading && (
          <>
            {viewMode === "list" ? (
              // 列表檢視
              <>
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

                {/* 分頁元件 */}
                <HospitalPagination
                  currentPage={searchResponse.page}
                  totalPages={Math.ceil(searchResponse.total / searchResponse.limit)}
                  totalItems={searchResponse.total}
                  pageSize={searchResponse.limit}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  isLoading={isLoading}
                />
              </>
            ) : (
              // 地圖檢視
              <div className="space-y-4">
                <HospitalMap
                  hospitals={searchResponse.hospitals}
                  center={userLocation || undefined}
                  zoom={userLocation ? 14 : 11}
                  height="600px"
                  onHospitalClick={handleViewDetail}
                  showUserLocation={!!userLocation}
                  onLocationFound={handleLocationFound}
                  onLocationError={handleLocationError}
                  requestLocation={requestLocation}
                />

                {/* 地圖模式下的簡單分頁 */}
                <div className="flex justify-center">
                  <HospitalPagination
                    currentPage={searchResponse.page}
                    totalPages={Math.ceil(searchResponse.total / searchResponse.limit)}
                    totalItems={searchResponse.total}
                    pageSize={searchResponse.limit}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}