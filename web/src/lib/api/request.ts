import axios from "axios";
import { getAccessToken } from "@auth0/nextjs-auth0";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    data?: any;
    params?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const accessToken = await getAccessToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    };
    const response = await axios({
      url,
      method: options.method || "GET",
      data: options.data,
      params: options.params,
      headers,
    });
    const data = response.data;
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error: any) {
    let errorMessage = "API 請求錯誤";
    if (error.response) {
      // 伺服器有回應
      errorMessage = `API 請求失敗: ${error.response.status} ${error.response.statusText}`;
      if (error.response.data) {
        if (typeof error.response.data === "string") {
          errorMessage += ` - ${error.response.data}`;
        } else if (error.response.data.error) {
          errorMessage += ` - ${error.response.data.error}`;
        } else if (error.response.data.message) {
          errorMessage += `: ${error.response.data.message}`;
        }
      }
    } else if (error.request) {
      // 沒有收到伺服器回應
      errorMessage = "API 無回應";
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
}

// 公開 API 請求函數（不需要認證）
export async function publicApiRequest<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    data?: any;
    params?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    const response = await axios({
      url,
      method: options.method || "GET",
      data: options.data,
      params: options.params,
      headers,
    });
    const data = response.data;
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  } catch (error: any) {
    let errorMessage = "API 請求錯誤";
    if (error.response) {
      // 伺服器有回應
      errorMessage = `API 請求失敗: ${error.response.status} ${error.response.statusText}`;
      if (error.response.data) {
        if (typeof error.response.data === "string") {
          errorMessage += ` - ${error.response.data}`;
        } else if (error.response.data.error) {
          errorMessage += ` - ${error.response.data.error}`;
        } else if (error.response.data.message) {
          errorMessage += `: ${error.response.data.message}`;
        }
      }
    } else if (error.request) {
      // 沒有收到伺服器回應
      errorMessage = "API 無回應";
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
}
