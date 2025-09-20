import {
  Hospital,
  SearchHospitalsParams,
  NearbyHospitalsParams,
  SearchHospitalsResponse,
  GetHospitalDetailResponse,
  ListNearbyHospitalsResponse,
  DEFAULT_SEARCH_PARAMS,
  DEFAULT_NEARBY_PARAMS,
} from "../types/hospital";
import { publicApiRequest } from "./request";

// 醫院 API 服務
export const hospitalApi = {
  // 搜尋醫院 - GET /api/v1/hospitals
  async searchHospitals(
    params: SearchHospitalsParams = {}
  ): Promise<SearchHospitalsResponse> {
    const searchParams = { ...DEFAULT_SEARCH_PARAMS, ...params };

    const response = await publicApiRequest<SearchHospitalsResponse>(
      "/api/v1/hospitals",
      {
        method: "GET",
        params: searchParams,
      }
    );

    return response;
  },

  // 根據 ID 獲取醫院詳細資訊 - GET /api/v1/hospitals/{id}
  async getHospitalById(id: string): Promise<Hospital> {
    const response = await publicApiRequest<GetHospitalDetailResponse>(
      `/api/v1/hospitals/${id}`,
      {
        method: "GET",
      }
    );

    return response.hospital;
  },

  // 查詢附近醫院 - GET /api/v1/hospitals/nearby
  async getNearbyHospitals(params: NearbyHospitalsParams): Promise<Hospital[]> {
    const searchParams = { ...DEFAULT_NEARBY_PARAMS, ...params };

    const response = await publicApiRequest<ListNearbyHospitalsResponse>(
      "/api/v1/hospitals/nearby",
      {
        method: "GET",
        params: searchParams,
      }
    );

    return response.hospitals;
  },

  // 便利方法：依縣市搜尋醫院
  async searchByCounty(
    county: string,
    additionalParams: Partial<SearchHospitalsParams> = {}
  ): Promise<SearchHospitalsResponse> {
    return this.searchHospitals({
      county,
      ...additionalParams,
    });
  },

  // 便利方法：依關鍵字搜尋醫院
  async searchByKeyword(
    keyword: string,
    additionalParams: Partial<SearchHospitalsParams> = {}
  ): Promise<SearchHospitalsResponse> {
    return this.searchHospitals({
      keyword,
      ...additionalParams,
    });
  },

  // 便利方法：依狀態篩選醫院
  async searchByStatus(
    status: string,
    additionalParams: Partial<SearchHospitalsParams> = {}
  ): Promise<SearchHospitalsResponse> {
    return this.searchHospitals({
      status,
      ...additionalParams,
    });
  },

  // 便利方法：依執照類型篩選醫院
  async searchByLicenseType(
    licenseType: string,
    additionalParams: Partial<SearchHospitalsParams> = {}
  ): Promise<SearchHospitalsResponse> {
    return this.searchHospitals({
      license_type: licenseType,
      ...additionalParams,
    });
  },

  // 便利方法：距離排序搜尋
  async searchByDistance(
    latitude: number,
    longitude: number,
    radius: number = 10,
    additionalParams: Partial<SearchHospitalsParams> = {}
  ): Promise<SearchHospitalsResponse> {
    return this.searchHospitals({
      latitude,
      longitude,
      radius,
      sort_by: "distance",
      ...additionalParams,
    });
  },
};

// React Query hooks 的 key 工廠
export const hospitalQueryKeys = {
  all: ["hospitals"] as const,

  searches: () => [...hospitalQueryKeys.all, "search"] as const,
  search: (params: SearchHospitalsParams) =>
    [...hospitalQueryKeys.searches(), { params }] as const,

  nearby: () => [...hospitalQueryKeys.all, "nearby"] as const,
  nearbySearch: (params: NearbyHospitalsParams) =>
    [...hospitalQueryKeys.nearby(), { params }] as const,

  details: () => [...hospitalQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...hospitalQueryKeys.details(), id] as const,

  // 縣市相關查詢
  counties: () => [...hospitalQueryKeys.all, "county"] as const,
  county: (county: string, params?: Partial<SearchHospitalsParams>) =>
    [...hospitalQueryKeys.counties(), county, { params }] as const,

  // 關鍵字相關查詢
  keywords: () => [...hospitalQueryKeys.all, "keyword"] as const,
  keyword: (keyword: string, params?: Partial<SearchHospitalsParams>) =>
    [...hospitalQueryKeys.keywords(), keyword, { params }] as const,

  // 狀態相關查詢
  statuses: () => [...hospitalQueryKeys.all, "status"] as const,
  status: (status: string, params?: Partial<SearchHospitalsParams>) =>
    [...hospitalQueryKeys.statuses(), status, { params }] as const,

  // 執照類型相關查詢
  licenseTypes: () => [...hospitalQueryKeys.all, "licenseType"] as const,
  licenseType: (licenseType: string, params?: Partial<SearchHospitalsParams>) =>
    [...hospitalQueryKeys.licenseTypes(), licenseType, { params }] as const,
};

// 導出預設 API 實例
export default hospitalApi;
