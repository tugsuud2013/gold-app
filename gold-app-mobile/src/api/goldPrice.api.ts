import { apiClient } from './client';
import { GoldPrice } from '../types';

export const goldPriceApi = {
  current: () => apiClient.get<never, GoldPrice>('/api/gold-price/current'),
  history: (filter: '1d' | '7d' | '1m' | '6m' | '1y') =>
    apiClient.get<never, GoldPrice[]>(`/api/gold-price/history?filter=${filter}`),
};
