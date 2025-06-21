import {
  Pet,
  CreatePetRequest,
  UpdatePetRequest,
  CreatePetResponse,
  GetPetResponse,
  ListPetsResponse,
  UpdatePetResponse,
  DeletePetResponse,
} from '../types/pet';

// API 基礎 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 通用 API 請求函式
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    // 獲取 Auth0 存取令牌
    let token: string | null = null;
    
    if (typeof window !== 'undefined') {
      // 客戶端：通過 Auth0 API 路由獲取令牌
      try {
        const tokenResponse = await fetch('/api/auth/token');
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          token = tokenData.accessToken;
        }
      } catch (tokenError) {
        console.warn('無法獲取存取令牌:', tokenError);
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API 請求失敗: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();
    
    // 檢查回應中是否有錯誤
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error(`API 請求錯誤 (${endpoint}):`, error);
    throw error;
  }
}

// 寵物 API 服務
export const petApi = {
  // 獲取所有寵物 - GET /api/v1/pets
  async listPets(): Promise<Pet[]> {
    const response = await apiRequest<ListPetsResponse>('/api/v1/pets');
    return response.pets;
  },

  // 根據 ID 獲取寵物 - GET /api/v1/pets/{id}
  async getPetById(id: string): Promise<Pet> {
    const response = await apiRequest<GetPetResponse>(`/api/v1/pets/${id}`);
    return response.pet;
  },

  // 建立新寵物 - POST /api/v1/pets
  async createPet(petData: CreatePetRequest): Promise<Pet> {
    const response = await apiRequest<CreatePetResponse>('/api/v1/pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
    return response.pet;
  },

  // 更新寵物 - PUT /api/v1/pets/{id}
  async updatePet(id: string, petData: Omit<UpdatePetRequest, 'id'>): Promise<void> {
    await apiRequest<UpdatePetResponse>(`/api/v1/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...petData, id }),
    });
  },

  // 刪除寵物 - DELETE /api/v1/pets/{id}
  async deletePet(id: string): Promise<void> {
    await apiRequest<DeletePetResponse>(`/api/v1/pets/${id}`, {
      method: 'DELETE',
    });
  },
};

// React Query hooks 的 key 工廠
export const petQueryKeys = {
  all: ['pets'] as const,
  lists: () => [...petQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...petQueryKeys.lists(), { filters }] as const,
  details: () => [...petQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...petQueryKeys.details(), id] as const,
};