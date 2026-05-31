import { apiClient } from './client';
import { News } from '../types';

export const newsApi = {
  list: (page = 1) => apiClient.get<never, News[]>(`/news?page=${page}`),
  detail: (id: string) => apiClient.get<never, News>(`/news/${id}`),
};
