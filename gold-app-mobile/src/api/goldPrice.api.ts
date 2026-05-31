import { apiClient } from './client';
import { GoldPrice } from '../types';
import { mapGoldPrice } from '../utils/mappers';

export const goldPriceApi = {
  current: async (): Promise<GoldPrice | null> => {
    const raw = await apiClient.get<never, Record<string, unknown> | null>('/gold-price/current');
    return mapGoldPrice(raw);
  },

  history: async (filter: '1d' | '7d' | '1m' | '6m' | '1y') => {
    const data = await apiClient.get<never, { prices: Record<string, unknown>[]; filter: string }>(
      `/gold-price/history?filter=${filter}`,
    );
    return (data.prices ?? [])
      .map((item) => mapGoldPrice(item))
      .filter((item): item is GoldPrice => item != null);
  },
};
