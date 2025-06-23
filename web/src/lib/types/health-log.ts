export interface CreateHealthLogInput {
  date: string;
  type: string;
  description: string;
}

// 可依需求擴充其他 HealthLog 相關型別
export interface HealthLog {
  id: string;
  date: string;
  type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
} 