import axios from 'axios';

export interface CreateHealthLogInput {
  date: string;
  type: string;
  description: string;
}

export async function createHealthLog(input: CreateHealthLogInput) {
  await axios.post('/api/v1/health-logs', input);
} 