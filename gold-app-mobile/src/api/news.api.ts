import { apiClient } from './client';
import { News, PaginatedResponse } from '../types';
import { mapNewsItem } from '../utils/mappers';

export const newsApi = {
  list: async (page = 1, limit = 10): Promise<News[]> => {
    const data = await apiClient.get<never, PaginatedResponse<Record<string, unknown>>>(
      `/news?page=${page}&limit=${limit}`,
    );
    return (data.items ?? []).map(mapNewsItem);
  },

  detail: async (id: string): Promise<News> => {
    const raw = await apiClient.get<never, Record<string, unknown>>(`/news/${id}`);
    return mapNewsItem(raw);
  },
};
