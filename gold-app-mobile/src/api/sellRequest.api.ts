import { apiClient } from './client';
import { SellRequest } from '../types';

export const sellRequestApi = {
  list: () => apiClient.get<never, SellRequest[]>('/sell-requests'),
  create: (grams: number) => apiClient.post('/sell-requests', { grams }),
};
