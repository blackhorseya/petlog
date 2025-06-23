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

// 寵物 API 服務
export const petApi = {
  // 獲取所有寵物 - GET /api/v1/pets
  async listPets(): Promise<Pet[]> {
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
