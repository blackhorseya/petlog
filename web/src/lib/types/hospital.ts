// 醫院模型類型定義，對應後端 endpoint.HospitalDTO
export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  county: string;
  veterinarian: string;
  license_type: string;
  license_no: string;
  status: string;
  issued_date: string;
  coordinates: Coordinates;
  created_at: string;
  updated_at: string;
}

// 座標型別定義，對應 endpoint.Coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// 搜尋醫院請求參數，對應 API: GET /api/v1/hospitals
export interface SearchHospitalsParams {
  keyword?: string; // 搜尋關鍵字（醫院名稱、地址、獸醫師）
  county?: string; // 縣市篩選
  status?: string; // 狀態篩選（開業、歇業等）
  license_type?: string; // 執照類型篩選（動物醫院、動物診所）
  latitude?: number; // 座標緯度（用於距離排序）
  longitude?: number; // 座標經度（用於距離排序）
  radius?: number; // 搜尋半徑（公里）
  page?: number; // 頁碼（預設1）
  limit?: number; // 每頁數量（預設20）
  sort_by?: string; // 排序方式（distance, name）
}

// 附近醫院查詢請求參數，對應 API: GET /api/v1/hospitals/nearby
export interface NearbyHospitalsParams {
  latitude: number; // 使用者位置緯度（必填）
  longitude: number; // 使用者位置經度（必填）
  radius_km?: number; // 搜尋半徑（公里，預設10）
  limit?: number; // 結果數量限制（預設50）
}

// 搜尋統計資訊，對應 query.SearchStats
export interface SearchStats {
  total_hospitals: number;
  by_status: Record<string, number>;
  by_license_type: Record<string, number>;
  by_county: Record<string, number>;
}

// API 回應類型

// 搜尋醫院回應，對應 endpoint.SearchHospitalsResponse
export interface SearchHospitalsResponse {
  hospitals: Hospital[];
  total: number;
  page: number;
  limit: number;
  stats: SearchStats;
  error?: any;
}

// 取得醫院詳細資訊回應，對應 endpoint.GetHospitalDetailResponse
export interface GetHospitalDetailResponse {
  hospital: Hospital;
  error?: any;
}

// 附近醫院查詢回應，對應 endpoint.ListNearbyHospitalsResponse
export interface ListNearbyHospitalsResponse {
  hospitals: Hospital[];
  error?: any;
}

// 醫院狀態常數（根據實際 API 回應）
export const HOSPITAL_STATUS = {
  ACTIVE: "開業",
  INACTIVE: "歇業",
  SUSPENDED: "停業",
} as const;

// 執照類型常數（根據實際 API 回應）
export const LICENSE_TYPE = {
  VETERINARIAN: "獸醫師",
  VETERINARY_ASSISTANT: "獸醫佐",
} as const;

// 排序選項
export const SORT_BY = {
  DISTANCE: "distance",
  NAME: "name",
} as const;

export type HospitalStatus =
  (typeof HOSPITAL_STATUS)[keyof typeof HOSPITAL_STATUS];
export type LicenseType = (typeof LICENSE_TYPE)[keyof typeof LICENSE_TYPE];
export type SortOption = (typeof SORT_BY)[keyof typeof SORT_BY];

// 台灣縣市列表
export const TAIWAN_COUNTIES = [
  "台北市",
  "新北市",
  "桃園市",
  "台中市",
  "台南市",
  "高雄市",
  "新竹縣",
  "苗栗縣",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義縣",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "台東縣",
  "澎湖縣",
  "金門縣",
  "連江縣",
  "基隆市",
  "新竹市",
  "嘉義市",
] as const;

export type TaiwanCounty = (typeof TAIWAN_COUNTIES)[number];

// 預設搜尋參數
export const DEFAULT_SEARCH_PARAMS: Partial<SearchHospitalsParams> = {
  page: 1,
  limit: 20,
  sort_by: SORT_BY.NAME,
};

export const DEFAULT_NEARBY_PARAMS: Partial<NearbyHospitalsParams> = {
  radius_km: 10,
  limit: 50,
};
