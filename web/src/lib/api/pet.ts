import {
  Pet,
  CreatePetRequest,
  UpdatePetRequest,
  CreatePetResponse,
  GetPetResponse,
  ListPetsResponse,
  UpdatePetResponse,
  DeletePetResponse,
} from "../types/pet";
import { apiRequest } from "./request";
import { mockPets } from "./expense-mock";

// 是否使用 mock data（開發環境下預設為 true）
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// 模擬 API 延遲
const delay = (ms: number = 200) => 
  new Promise(resolve => setTimeout(resolve, ms));

// 轉換 mock 寵物資料為正式格式
function convertMockPetToPet(mockPet: typeof mockPets[0]): Pet {
  return {
    id: mockPet.id,
    name: mockPet.name,
    owner_id: 'user1',
    avatar_url: '', // 簡化處理
    dob: mockPet.dob || '',
    breed: mockPet.breed || '',
    microchip_id: '',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };
}

// 寵物 API 服務
export const petApi = {
  // 獲取所有寵物 - GET /api/v1/pets
  async listPets(): Promise<Pet[]> {
    if (USE_MOCK_DATA) {
      await delay(200);
      return mockPets.map(convertMockPetToPet);
    }

    const response = await apiRequest<ListPetsResponse>("/api/v1/pets");
    return response.pets;
  },

  // 根據 ID 獲取寵物 - GET /api/v1/pets/{id}
  async getPetById(id: string): Promise<Pet> {
    const response = await apiRequest<GetPetResponse>(`/api/v1/pets/${id}`);
    return response.pet;
  },

  // 建立新寵物 - POST /api/v1/pets
  async createPet(petData: CreatePetRequest): Promise<Pet> {
    const response = await apiRequest<CreatePetResponse>("/api/v1/pets", {
      method: "POST",
      data: petData,
    });
    return response.pet;
  },

  // 更新寵物 - PUT /api/v1/pets/{id}
  async updatePet(
    id: string,
    petData: Omit<UpdatePetRequest, "id">
  ): Promise<void> {
    await apiRequest<UpdatePetResponse>(`/api/v1/pets/${id}`, {
      method: "PUT",
      data: { ...petData, id },
    });
  },

  // 刪除寵物 - DELETE /api/v1/pets/{id}
  async deletePet(id: string): Promise<void> {
    await apiRequest<DeletePetResponse>(`/api/v1/pets/${id}`, {
      method: "DELETE",
    });
  },
};

// React Query hooks 的 key 工廠
export const petQueryKeys = {
  all: ["pets"] as const,
  lists: () => [...petQueryKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...petQueryKeys.lists(), { filters }] as const,
  details: () => [...petQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...petQueryKeys.details(), id] as const,
};
