import axios from 'axios';
import { getAccessToken } from '@auth0/nextjs-auth0';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface CreateHealthLogInput {
  date: string;
  type: string;
  description: string;
}

export async function createHealthLog(input: CreateHealthLogInput) {
  const accessToken = await getAccessToken();
  await axios.post(`${baseUrl}/api/v1/health-logs`, input, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
} 