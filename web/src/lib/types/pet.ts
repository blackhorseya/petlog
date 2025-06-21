// 寵物模型類型定義，對應後端 model.Pet
export interface Pet {
  id: string;
  name: string;
  avatar_url?: string;
  breed?: string;
  dob?: string;
  microchip_id?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

// 建立寵物請求類型，對應 endpoint.CreatePetRequest
export interface CreatePetRequest {
  name: string;
  avatar_url?: string;
  dob: string;
  breed?: string;
  microchip_id?: string;
}

// 更新寵物請求類型，對應 endpoint.UpdatePetRequest
export interface UpdatePetRequest {
  id: string;
  name: string;
  avatar_url?: string;
  dob: string;
  breed?: string;
  microchip_id?: string;
}

// API 回應類型
export interface CreatePetResponse {
  pet: Pet;
  error?: any;
}

export interface GetPetResponse {
  pet: Pet;
  error?: any;
}

export interface ListPetsResponse {
  pets: Pet[];
  error?: any;
}

export interface UpdatePetResponse {
  error?: any;
}

export interface DeletePetResponse {
  error?: any;
}

// 表單類型定義
export interface PetFormData {
  name: string;
  avatar_url?: string;
  dob: string;
  breed?: string;
  microchip_id?: string;
}