"use client";

import * as React from "react";
import { Search, Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SearchHospitalsParams,
  TAIWAN_COUNTIES,
  HOSPITAL_STATUS,
  LICENSE_TYPE,
  SORT_BY,
} from "@/lib/types/hospital";

interface HospitalSearchProps {
  onSearch: (params: SearchHospitalsParams) => void;
  isLoading?: boolean;
  initialParams?: SearchHospitalsParams;
}

export function HospitalSearch({
  onSearch,
  isLoading = false,
  initialParams = {},
}: HospitalSearchProps) {
  const [keyword, setKeyword] = React.useState(initialParams.keyword || "");
  const [county, setCounty] = React.useState(initialParams.county || "all");
  const [status, setStatus] = React.useState(initialParams.status || "all");
  const [licenseType, setLicenseType] = React.useState(
    initialParams.license_type || "all"
  );
  const [sortBy, setSortBy] = React.useState(
    initialParams.sort_by || SORT_BY.NAME
  );
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // 使用 debounce 優化搜尋輸入效能
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const debouncedKeyword = React.useCallback((value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setKeyword(value);
    }, 300);
  }, []);

  // 當搜尋條件改變時自動搜尋
  React.useEffect(() => {
    const searchParams: SearchHospitalsParams = {
      keyword: keyword.trim() || undefined,
      county: county === "all" ? undefined : county,
      status: status === "all" ? undefined : status,
      license_type: licenseType === "all" ? undefined : licenseType,
      sort_by: sortBy,
      page: 1, // 重新搜尋時重置頁碼
    };

    onSearch(searchParams);
  }, [keyword, county, status, licenseType, sortBy, onSearch]);

  // 清除所有篩選條件
  const handleClearFilters = () => {
    setKeyword("");
    setCounty("all");
    setStatus("all");
    setLicenseType("all");
    setSortBy(SORT_BY.NAME);
  };

  // 檢查是否有啟用的篩選條件
  const hasActiveFilters = keyword || (county !== "all") || (status !== "all") || (licenseType !== "all");

  return (
    <div className="space-y-4">
      {/* 主要搜尋列 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜尋醫院名稱、地址或獸醫師..."
            value={keyword}
            onChange={(e) => {
              const value = e.target.value;
              setKeyword(value);
              debouncedKeyword(value);
            }}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={isLoading}
        >
          <Filter className="mr-2 h-4 w-4" />
          進階篩選
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            清除
          </Button>
        )}
      </div>

      {/* 進階篩選面板 */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/30">
          {/* 縣市篩選 */}
          <div className="space-y-2">
            <Label htmlFor="county-select">縣市</Label>
            <Select value={county} onValueChange={setCounty} disabled={isLoading}>
              <SelectTrigger id="county-select">
                <SelectValue placeholder="選擇縣市" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部縣市</SelectItem>
                {TAIWAN_COUNTIES.map((countyName) => (
                  <SelectItem key={countyName} value={countyName}>
                    {countyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 營業狀態篩選 */}
          <div className="space-y-2">
            <Label htmlFor="status-select">營業狀態</Label>
            <Select value={status} onValueChange={setStatus} disabled={isLoading}>
              <SelectTrigger id="status-select">
                <SelectValue placeholder="選擇狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部狀態</SelectItem>
                <SelectItem value={HOSPITAL_STATUS.ACTIVE}>
                  {HOSPITAL_STATUS.ACTIVE}
                </SelectItem>
                <SelectItem value={HOSPITAL_STATUS.INACTIVE}>
                  {HOSPITAL_STATUS.INACTIVE}
                </SelectItem>
                <SelectItem value={HOSPITAL_STATUS.SUSPENDED}>
                  {HOSPITAL_STATUS.SUSPENDED}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 執照類型篩選 */}
          <div className="space-y-2">
            <Label htmlFor="license-select">執照類型</Label>
            <Select
              value={licenseType}
              onValueChange={setLicenseType}
              disabled={isLoading}
            >
              <SelectTrigger id="license-select">
                <SelectValue placeholder="選擇執照類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部類型</SelectItem>
                <SelectItem value={LICENSE_TYPE.VETERINARIAN}>
                  {LICENSE_TYPE.VETERINARIAN}
                </SelectItem>
                <SelectItem value={LICENSE_TYPE.VETERINARY_ASSISTANT}>
                  {LICENSE_TYPE.VETERINARY_ASSISTANT}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 排序選項 */}
          <div className="space-y-2">
            <Label htmlFor="sort-select">排序方式</Label>
            <Select value={sortBy} onValueChange={setSortBy} disabled={isLoading}>
              <SelectTrigger id="sort-select">
                <SelectValue placeholder="選擇排序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SORT_BY.NAME}>依名稱排序</SelectItem>
                <SelectItem value={SORT_BY.DISTANCE}>依距離排序</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* 篩選條件摘要 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span>目前篩選：</span>
          {keyword && (
            <span className="bg-muted px-2 py-1 rounded">
              關鍵字: {keyword}
            </span>
          )}
          {county !== "all" && (
            <span className="bg-muted px-2 py-1 rounded">縣市: {county}</span>
          )}
          {status !== "all" && (
            <span className="bg-muted px-2 py-1 rounded">狀態: {status}</span>
          )}
          {licenseType !== "all" && (
            <span className="bg-muted px-2 py-1 rounded">
              執照: {licenseType}
            </span>
          )}
        </div>
      )}
    </div>
  );
}